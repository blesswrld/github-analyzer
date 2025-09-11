// Тип для информации о профиле, который мы сохраняем
export type ProfileInfo = {
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    type: string; // 'User' или 'Organization'
};

// Тип для одного репозитория в списке "Top Repositories"
export type RepoData = {
    name: string;
    url: string;
    stars: number;
    description: string;
    language: string;
};

// Тип для данных о языках для графика
export type LanguageData = {
    id: string;
    label: string;
    value: number;
};

// Тип для объекта со всей статистикой, который хранится в JSONB в Supabase
export type StatsData = {
    profileInfo: ProfileInfo;
    languages: LanguageData[];
    totalStars: number;
    totalForks: number;
    topRepos: RepoData[];
    isPartial?: boolean; // Флаг, указывающий на частичный анализ
};

// Основной тип для одного объекта анализа, который мы получаем из базы данных
export type AnalysisData = {
    id: string;
    github_username: string;
    stats_data: StatsData;
};

// Тип для ответа от API эндпоинта /api/contributions
export type ContributionData = {
    contributions: { date: string; count: number }[];
    stats: {
        totalYearContributions: number;
        longestStreak: number;
        currentStreak: number;
        mostProductiveDay: string;
    };
};
