import { Octokit } from "@octokit/core";
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

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

    const supabase = createServerSupabaseClient({ req, res });
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
        const { data: userProfile } = await octokit.request(
            "GET /users/{username}",
            {
                username: username,
            }
        );

        const { data: repos } = await octokit.request(
            "GET /users/{username}/repos",
            {
                username: username,
                type: "owner",
                per_page: 100,
            }
        );

        const languageStats: { [key: string]: number } = {};
        let totalStars = 0;
        let totalForks = 0;
        let mostStarredRepo = { name: "", stars: -1, url: "" };

        for (const repo of repos) {
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

        const statsData = {
            profileInfo: {
                name: userProfile.name ?? userProfile.login,
                avatar_url: userProfile.avatar_url ?? "",
                bio: userProfile.bio ?? "",
                public_repos: userProfile.public_repos ?? 0,
                followers: userProfile.followers ?? 0,
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
        // @ts-ignore
        if (error.status === 404) {
            return res
                .status(404)
                .json({ message: `User '${username}' not found on GitHub.` });
        }
        res.status(500).json({
            message: "An error occurred while analyzing the profile.",
        });
    }
}
