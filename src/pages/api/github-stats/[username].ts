import { Octokit } from "@octokit/core";
import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
// ИМПОРТИРУЕМ ТИПЫ ИЗ OCTOKIT ДЛЯ ЗАМЕНЫ 'ANY'
import type { GetResponseTypeFromEndpointMethod } from "@octokit/types";

// Мы используем ее только для вывода типов, что является валидным сценарием.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const octokitForTypes = new Octokit();
type UserProfileResponse = GetResponseTypeFromEndpointMethod<
    typeof octokitForTypes.request<"GET /users/{username}">
>;
type OrgProfileResponse = GetResponseTypeFromEndpointMethod<
    typeof octokitForTypes.request<"GET /orgs/{org}">
>;
type ReposResponse = GetResponseTypeFromEndpointMethod<
    typeof octokitForTypes.request<"GET /users/{username}/repos">
>;
// Объединяем все возможные типы профиля в один
type AnyProfileData = UserProfileResponse["data"] | OrgProfileResponse["data"];
// Объединяем типы профилей, которые точно являются пользовательскими
type AnyUserProfile = UserProfileResponse["data"];

// Эта функция-помощник теперь принимает наш объединенный тип и проверяет его.
function isUserProfile(profile: AnyProfileData): profile is AnyUserProfile {
    // Мы проверяем наличие свойства, которое есть только у пользователей, но не у организаций.
    // 'followers_url' - отличный кандидат.
    return "followers_url" in profile;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { username } = req.query;

    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Username is required" });
    }

    const supabase = createPagesServerClient({ req, res });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Мы все еще используем токен пользователя, если он залогинен, для более высоких лимитов API
    const token = session?.provider_token || process.env.GITHUB_TOKEN;

    if (!token) {
        return res
            .status(500)
            .json({ message: "GitHub token is not configured." });
    }

    const octokit = new Octokit({ auth: token });

    try {
        // Используем конкретные типы вместо 'any'
        let profileData: AnyProfileData | undefined = undefined;
        const reposData: ReposResponse["data"] = [];

        // --- РУЧНОЙ ЦИКЛ ПАГИНАЦИИ ДЛЯ ПУБЛИЧНЫХ ДАННЫХ ---
        let page = 1;
        const per_page = 100;

        while (true) {
            let currentPageRepos: ReposResponse["data"] = [];

            // Пробуем получить данные как для пользователя
            try {
                // Профиль запрашиваем только на первой странице, чтобы избежать лишних запросов
                if (page === 1) {
                    const { data: userProfile } = await octokit.request(
                        "GET /users/{username}",
                        { username }
                    );
                    profileData = userProfile;
                }
                const { data } = await octokit.request(
                    "GET /users/{username}/repos",
                    { username, type: "owner", per_page, page }
                );
                currentPageRepos = data;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (userError) {
                // Если не удалось, пробуем как организацию
                try {
                    if (page === 1) {
                        const { data: orgProfile } = await octokit.request(
                            "GET /orgs/{org}",
                            { org: username }
                        );
                        profileData = orgProfile;
                    }
                    const { data } = await octokit.request(
                        "GET /orgs/{org}/repos",
                        { org: username, type: "public", per_page, page }
                    );
                    currentPageRepos = data;
                } catch (orgError) {
                    // Проверяем, является ли ошибка объектом и есть ли у него свойство 'status'
                    if (
                        page === 1 &&
                        typeof orgError === "object" &&
                        orgError &&
                        "status" in orgError &&
                        orgError.status === 404
                    ) {
                        return res.status(404).json({
                            message: `User or Organization '${username}' not found.`,
                        });
                    }
                    // Если ошибка другая, просто выходим из цикла
                    break;
                }
            }

            reposData.push(...currentPageRepos);

            if (currentPageRepos.length < per_page) {
                break;
            }

            page++;
        }

        // Проверяем, была ли profileData успешно получена
        if (!profileData) {
            throw new Error(
                `Failed to fetch profile data for ${username}. It might not exist or there was a network error.`
            );
        }

        console.log(`Total repos fetched for ${username}: ${reposData.length}`);

        // Начинаем агрегацию данных
        const languageStats: { [key: string]: number } = {};
        let totalStars = 0;
        let totalForks = 0;
        let mostStarredRepo = { name: "", stars: -1, url: "" };

        for (const repo of reposData) {
            if (repo.language) {
                languageStats[repo.language] =
                    (languageStats[repo.language] || 0) + 1;
            }
            totalStars += repo.stargazers_count ?? 0;
            totalForks += repo.forks_count ?? 0;

            if ((repo.stargazers_count ?? -1) > mostStarredRepo.stars) {
                mostStarredRepo = {
                    name: repo.full_name ?? "Unknown Repo",
                    stars: repo.stargazers_count ?? 0,
                    url: repo.html_url ?? "#",
                };
            }
        }

        // Находим топ-5 репозиториев по количеству звезд
        const topRepos = [...reposData] // Создаем копию, чтобы не изменять исходный массив
            .sort(
                (a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0)
            ) // Сортируем по звездам (убывание)
            .slice(0, 5) // Берем первые 5
            .map((repo) => ({
                // Выбираем только нужные поля, чтобы не хранить лишнего
                name: repo.full_name ?? "Unknown Repo",
                url: repo.html_url ?? "#",
                stars: repo.stargazers_count ?? 0,
                description: repo.description ?? "No description.",
                language: repo.language ?? "N/A",
            }));

        const languages = Object.entries(languageStats)
            .map(([name, count]) => ({
                id: name,
                label: name,
                value: count,
            }))
            .sort((a, b) => b.value - a.value);

        // Собираем объект со статистикой, адаптируясь под user/org
        const statsData = {
            profileInfo: {
                name: profileData.name ?? profileData.login,
                avatar_url: profileData.avatar_url ?? "",
                bio: isUserProfile(profileData) ? profileData.bio ?? "" : "",
                public_repos:
                    "public_repos" in profileData &&
                    typeof profileData.public_repos === "number"
                        ? profileData.public_repos
                        : reposData.length,
                followers: isUserProfile(profileData)
                    ? profileData.followers ?? 0
                    : 0,
            },
            languages,
            totalStars,
            totalForks,
            mostStarredRepo,
            topRepos, // <-- ДОБАВЛЯЕМ НАШ МАССИВ ТОП 5 РЕПО
        };

        const { data: analysisResult, error: insertError } = await supabase
            .from("analyses")
            .insert({
                github_username: username,
                stats_data: statsData,
                user_id: session?.user?.id || null,
            })
            .select("id")
            .single();

        if (insertError) {
            console.error("Supabase insert error:", insertError);
            throw new Error("Could not save analysis result.");
        }

        res.status(200).json({ analysisId: analysisResult.id });
    } catch (error) {
        console.error("GitHub API or processing error:", error);

        res.status(500).json({
            message: "An error occurred while analyzing the profile.",
        });
    }
}
