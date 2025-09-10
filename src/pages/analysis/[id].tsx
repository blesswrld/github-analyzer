import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatCard from "@/components/analysis/StatCard";
import { Star, GitFork, Users, Book, Share2 } from "lucide-react";
import AnalysisSkeleton from "@/components/skeletons/AnalysisSkeleton";
import LanguagesChart from "@/components/charts/LanguagesChart";
import { toast } from "sonner";
import TopReposCard from "@/components/analysis/TopReposCard";
import Head from "next/head";
import { MotionDiv } from "@/components/ui/MotionDiv"; // Импортируем наш компонент
import { AlertCircle } from "lucide-react"; // Иконка для примечания
import Link from "next/link";
import { useQuery } from "@tanstack/react-query"; // Добавляем useQuery
import ContributionCalendar from "@/components/analysis/ContributionCalendar";
import { BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ContributionStats from "@/components/analysis/ContributionStats";

// Определяем подробные типы для наших данных
type ProfileInfo = {
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    type: string; // <-- ДОБАВЛЯЕМ ТИП
};

type MostStarredRepo = {
    name: string;
    stars: number;
    url: string;
};

type LanguageData = { id: string; label: string; value: number };

// Обновляем наши типы, чтобы они включали topRepos
type RepoData = {
    name: string;
    url: string;
    stars: number;
    description: string;
    language: string;
};

type AnalysisData = {
    github_username: string;
    stats_data: {
        profileInfo: ProfileInfo;
        languages: LanguageData[];
        totalStars: number;
        totalForks: number;
        mostStarredRepo: MostStarredRepo;
        topRepos: RepoData[]; // <-- ДОБАВЛЯЕМ ТИП
        isPartial?: boolean; // <-- ДОБАВЛЯЕМ ТИП
    };
};

type AnalysisPageProps = {
    analysis: AnalysisData | null;
};

export default function AnalysisPage({ analysis }: AnalysisPageProps) {
    // Состояние для отслеживания загрузки на клиенте
    const [isLoading, setIsLoading] = useState(true);

    // --- ЛОГИКА ДЛЯ ЗАГРУЗКИ ДАННЫХ О КОММИТАХ ---
    const [showContributions, setShowContributions] = useState(false);

    const { data: contributionData, isLoading: isLoadingContributions } =
        useQuery({
            //  Используем optional chaining (?.) для безопасного доступа
            queryKey: ["contributions", analysis?.github_username],
            queryFn: () =>
                // Выполняем fetch только если analysis существует
                fetch(`/api/contributions/${analysis!.github_username}`).then(
                    (res) => res.json()
                ),
            // Добавляем проверку на 'analysis' в enabled
            enabled: showContributions && !!analysis, // Запрос выполнится только если showContributions=true И analysis существует
        });

    useEffect(() => {
        // Как только компонент монтируется на клиенте, мы считаем, что загрузка завершена.
        // Данные уже пришли через props из getServerSideProps.
        setIsLoading(false);
    }, []);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link Copied!", {
                description: "You can now share this analysis with others.",
                duration: 3000,
            });
        });
    };

    // Если isLoading=true, показываем скелетон.
    // Это сработает при любой загрузке страницы: прямой или через переход.
    if (isLoading || !analysis) {
        return (
            <>
                <Head>
                    {/* Если данные еще грузятся или их нет, можно показать
                    дефолтный заголовок */}
                    <title>Loading Analysis... - GitHub Profile Analyzer</title>
                </Head>
                {isLoading ? (
                    <AnalysisSkeleton />
                ) : (
                    <div>Analysis Not Found</div>
                )}
            </>
        );
    }

    // Если загрузка завершена, но данных нет (ошибка в getServerSideProps)
    if (!analysis) {
        return (
            <main className="container mx-auto p-8 text-center">
                <h1 className="text-4xl font-bold">Analysis Not Found</h1>
                <p className="text-muted-foreground mt-2">
                    The requested analysis does not exist or may have been
                    deleted.
                </p>
            </main>
        );
    }

    // Деструктурируем новые данные
    // isPartial, по умолчанию false
    const {
        profileInfo,
        totalStars,
        totalForks,
        languages,
        topRepos,
        isPartial = false,
    } = analysis.stats_data;

    // --- ЛОГИКА ДЛЯ ССЫЛОК ---
    const isUser = profileInfo.type === "User";
    const starsUrl = isUser
        ? `https://github.com/${analysis.github_username}?tab=stars`
        : `https://github.com/${analysis.github_username}`;

    // Когда данные есть, генерируем динамические теги
    const pageTitle = `Analysis for ${
        profileInfo.name || analysis.github_username
    } - GitHub Profile Analyzer`;
    const pageDescription = `In-depth analysis of ${
        analysis.github_username
    }'s GitHub profile, including top languages like ${
        analysis.stats_data.languages[0]?.label || ""
    } and ${analysis.stats_data.languages[1]?.label || ""}.`;

    // --- Ограничиваем количество языков для графика ---
    const topLanguages = languages.slice(0, 15);

    // Когда загрузка завершена и данные есть, рендерим основной контент
    return (
        <>
            {/* --- БЛОК С ДИНАМИЧЕСКИМИ МЕТА-ТЕГАМИ --- */}
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
            </Head>

            <main className="container mx-auto p-4 md:p-8">
                {/* Анимируем заголовок и кнопку */}
                <MotionDiv
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap gap-y-2 justify-between items-center mb-6"
                >
                    <h1 className="text-2xl md:text-4xl font-bold">
                        Analysis for{" "}
                        <span className="text-primary">
                            {analysis.github_username}
                        </span>
                    </h1>
                    <Button
                        variant="outline"
                        className=" cursor-pointer"
                        onClick={handleShare}
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </MotionDiv>

                <MotionDiv
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }, // Каждый дочерний элемент будет появляться с задержкой 0.1с
                    }}
                >
                    {/* Левая колонка: Профиль и ключевые метрики */}
                    <MotionDiv
                        className="lg:col-span-1 space-y-6"
                        // Дочерние элементы этого div тоже будут анимироваться
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.5 },
                            },
                        }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage
                                        src={profileInfo.avatar_url}
                                        alt={profileInfo.name}
                                    />
                                    <AvatarFallback>
                                        {profileInfo.name?.substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold break-all">
                                        {profileInfo.name}
                                    </h2>
                                    <Link
                                        href={`https://github.com/${analysis.github_username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <p className="text-muted-foreground hover:text-primary transition-colors">
                                            @{analysis.github_username}
                                        </p>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    {profileInfo.bio || "No bio provided."}
                                </p>
                            </CardContent>
                        </Card>

                        {/* --- МЕСТО ДЛЯ ПРИМЕЧАНИЯ --- */}
                        {isPartial && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 border rounded-lg bg-muted/50">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    Note: For very large profiles, metrics for{" "}
                                    <b>
                                        Total Stars, Total Forks, Languages, and
                                        Top Repositories
                                    </b>{" "}
                                    are calculated based on the most recent 500
                                    repositories. The total repository count is
                                    accurate.
                                </span>
                            </div>
                        )}

                        {/* Карточки с метриками */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Показываем карточку Followers только если их больше 0 (у организаций их нет) */}
                            {profileInfo.followers > 0 && (
                                <StatCard
                                    title="Followers"
                                    value={profileInfo.followers}
                                    icon={<Users size={20} />}
                                    // Передаем флаг для старта анимации
                                    startAnimation={!isLoading}
                                    href={`https://github.com/${analysis.github_username}?tab=followers`}
                                />
                            )}
                            <StatCard
                                title="Repositories"
                                value={profileInfo.public_repos}
                                icon={<Book size={20} />}
                                // Передаем флаг для старта анимации
                                startAnimation={!isLoading}
                                href={`https://github.com/${analysis.github_username}?tab=repositories`}
                            />
                            <StatCard
                                title="Total Stars"
                                value={totalStars}
                                icon={<Star size={20} />}
                                // Передаем флаг для старта анимации
                                startAnimation={!isLoading}
                                href={starsUrl} // Используем нашу условную ссылку
                            />
                            <StatCard
                                title="Total Forks"
                                value={totalForks}
                                icon={<GitFork size={20} />}
                                // Передаем флаг для старта анимации
                                startAnimation={!isLoading}
                                href={`https://github.com/${analysis.github_username}?tab=repositories`}
                            />
                        </div>

                        {/* ДОБАВЛЯЕМ КАРТОЧКУ С ТОП-5 РЕПОЗИТОРИЯМИ */}
                        {topRepos && topRepos.length > 0 && (
                            <TopReposCard repos={topRepos} />
                        )}
                    </MotionDiv>

                    {/* Правая колонка: График языков */}
                    <MotionDiv
                        className="lg:col-span-2 lg:sticky lg:top-8"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.5 },
                            },
                        }}
                    >
                        <Card className="h-full">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="break-all">
                                    {showContributions
                                        ? "Contribution Activity"
                                        : "Top Languages by Repository"}
                                </CardTitle>

                                {isUser && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setShowContributions(
                                                !showContributions
                                            )
                                        } // Переключение
                                    >
                                        <BarChart className="mr-2 h-4 w-4" />
                                        {showContributions
                                            ? "Back to Languages"
                                            : "View Contribution Insights"}
                                    </Button>
                                )}
                            </CardHeader>

                            <CardContent className="px-0 sm:px-2 md:px-6">
                                {showContributions && isUser ? (
                                    // Рендерим блок контрибьюций
                                    <>
                                        {isLoadingContributions ? (
                                            <Skeleton className="h-[250px] w-full" />
                                        ) : contributionData?.contributions ? (
                                            <div className="space-y-4">
                                                <ContributionCalendar
                                                    data={
                                                        contributionData.contributions
                                                    }
                                                />
                                                <ContributionStats
                                                    stats={
                                                        contributionData.stats
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <p>
                                                Could not load contribution data
                                                for this user.
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    // Рендерим блок языков
                                    <>
                                        {languages && languages.length > 0 ? (
                                            <LanguagesChart
                                                data={topLanguages}
                                            />
                                        ) : (
                                            <p>
                                                No public repositories with
                                                language data found.
                                            </p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </MotionDiv>
                </MotionDiv>
            </main>
        </>
    );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const { id } = ctx.params as { id: string };
    if (!id) return { props: { analysis: null } };

    const supabase = createPagesServerClient(ctx);

    const { data, error } = await supabase
        .from("analyses")
        .select("id, github_username, stats_data") // <-- ДОБАВЛЯЕМ 'id'
        .eq("id", id)
        .single();

    if (error || !data) {
        console.error(`Error fetching analysis for ID ${id}:`, error?.message);
        return { props: { analysis: null } };
    }

    return {
        props: {
            analysis: data as AnalysisData,
        },
    };
};
