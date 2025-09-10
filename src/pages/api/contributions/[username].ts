import { Octokit } from "@octokit/core";
import type { NextApiRequest, NextApiResponse } from "next";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

// Тип для ответа нашего API
type ContributionData = {
    contributions: { date: string; count: number }[];
    stats: {
        totalYearContributions: number;
        longestStreak: number;
        currentStreak: number;
        mostProductiveDay: string;
    };
};

// GraphQL-запрос для получения данных о контрибьюциях за последний год
const CONTRIBUTIONS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ContributionData | { message: string }>
) {
    const { username } = req.query;
    if (typeof username !== "string") {
        return res.status(400).json({ message: "Username is required" });
    }

    // Используем наш системный токен. Для GraphQL API он обязателен.
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    try {
        // Выполняем GraphQL-запрос
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await octokit.graphql(CONTRIBUTIONS_QUERY, {
            username,
        });

        const calendar =
            response.user.contributionsCollection.contributionCalendar;

        // Преобразуем полученные данные в плоский массив для heatmap
        const contributions: { date: string; count: number }[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        calendar.weeks.forEach((week: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            week.contributionDays.forEach((day: any) => {
                // Добавляем только дни, в которые были коммиты
                if (day.contributionCount > 0) {
                    contributions.push({
                        date: day.date,
                        count: day.contributionCount,
                    });
                }
            });
        });

        // --- Расчет дополнительной статистики (логика остается прежней) ---
        const contributionsByDate: Record<string, number> =
            contributions.reduce((acc, c) => {
                acc[c.date] = c.count;
                return acc;
            }, {} as Record<string, number>);

        const datesWithContributions = contributions
            .map((c) => parseISO(c.date))
            .sort((a, b) => a.getTime() - b.getTime());

        let longestStreak = 0;
        let currentStreak = 0;

        if (datesWithContributions.length > 0) {
            longestStreak = 1;
            currentStreak = 1;
            for (let i = 1; i < datesWithContributions.length; i++) {
                const diff = differenceInCalendarDays(
                    datesWithContributions[i],
                    datesWithContributions[i - 1]
                );
                if (diff === 1) {
                    currentStreak++;
                } else if (diff > 1) {
                    currentStreak = 1;
                }
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            }
            const today = new Date();
            const lastContributionDate =
                datesWithContributions[datesWithContributions.length - 1];
            if (differenceInCalendarDays(today, lastContributionDate) > 1) {
                currentStreak = 0;
            }
        }

        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        datesWithContributions.forEach((date) => {
            // Добавляем проверку, что дата существует в contributionsByDate
            if (contributionsByDate[format(date, "yyyy-MM-dd")]) {
                dayCounts[date.getDay()] +=
                    contributionsByDate[format(date, "yyyy-MM-dd")];
            }
        });
        const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const mostProductiveDayIndex = dayCounts.indexOf(
            Math.max(...dayCounts)
        );

        const stats = {
            totalYearContributions: calendar.totalContributions,
            longestStreak,
            currentStreak,
            mostProductiveDay: dayNames[mostProductiveDayIndex],
        };

        res.status(200).json({ contributions, stats });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(
            `Error fetching GraphQL contribution data for ${username}:`,
            error
        );
        // GraphQL возвращает ошибку с другим сообщением, если пользователь не найден
        if (error.message?.includes("Could not resolve to a User")) {
            return res
                .status(404)
                .json({ message: `User '${username}' not found on GitHub.` });
        }
        res.status(500).json({
            message: "An error occurred while fetching contribution data.",
        });
    }
}
