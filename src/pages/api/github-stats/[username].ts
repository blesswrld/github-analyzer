import { Octokit } from "@octokit/core";
import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

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

    const token = session?.provider_token || process.env.GITHUB_TOKEN;

    if (!token) {
        return res
            .status(500)
            .json({ message: "GitHub token is not configured." });
    }

    const octokit = new Octokit({ auth: token });

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let profileData: any; // Используем any, т.к. структура ответа для user и org разная
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let reposData: any[]; // Массив репозиториев

        // Пробуем получить данные как для пользователя
        try {
            const { data: userProfile } = await octokit.request(
                "GET /users/{username}",
                { username }
            );
            profileData = userProfile;
            const { data: userRepos } = await octokit.request(
                "GET /users/{username}/repos",
                { username, type: "owner", per_page: 100 }
            );
            reposData = userRepos;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (userError) {
            // Если не удалось, пробуем как организацию
            try {
                const { data: orgProfile } = await octokit.request(
                    "GET /orgs/{org}",
                    { org: username }
                );
                profileData = orgProfile;
                const { data: orgRepos } = await octokit.request(
                    "GET /orgs/{org}/repos",
                    { org: username, type: "public", per_page: 100 }
                );
                reposData = orgRepos;
            } catch (orgError) {
                // Если оба запроса не удались, скорее всего, такого имени не существует
                // @ts-ignore
                if (orgError.status === 404) {
                    return res.status(404).json({
                        message: `User or Organization '${username}' not found.`,
                    });
                }
                // Если ошибка другая, пробрасываем ее
                throw orgError;
            }
        }

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

        const languages = Object.entries(languageStats)
            .map(([name, count]) => ({ id: name, label: name, value: count }))
            .sort((a, b) => b.value - a.value);

        // Собираем объект со статистикой, адаптируясь под user/org
        const statsData = {
            profileInfo: {
                name: profileData.name ?? profileData.login,
                avatar_url: profileData.avatar_url ?? "",
                bio: profileData.bio ?? "",
                public_repos: profileData.public_repos ?? reposData.length,
                followers: profileData.followers ?? 0, // У организаций этого поля нет, будет 0
            },
            languages,
            totalStars,
            totalForks,
            mostStarredRepo,
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
