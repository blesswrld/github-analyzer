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

// Определяем подробные типы для наших данных
type ProfileInfo = {
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
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
    };
};

type AnalysisPageProps = {
    analysis: AnalysisData | null;
};

export default function AnalysisPage({ analysis }: AnalysisPageProps) {
    // Состояние для отслеживания загрузки на клиенте
    const [isLoading, setIsLoading] = useState(true);

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
    const { profileInfo, totalStars, totalForks, languages, topRepos } =
        analysis.stats_data;

    // Когда данные есть, генерируем динамические теги
    const pageTitle = `Analysis for ${
        profileInfo.name || analysis.github_username
    } - GitHub Profile Analyzer`;
    const pageDescription = `In-depth analysis of ${
        analysis.github_username
    }'s GitHub profile, including top languages like ${
        analysis.stats_data.languages[0]?.label || ""
    } and ${analysis.stats_data.languages[1]?.label || ""}.`;

    // Когда загрузка завершена и данные есть, рендерим основной контент
    return (
        <>
            {/* --- БЛОК С ДИНАМИЧЕСКИМИ МЕТА-ТЕГАМИ --- */}
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
            </Head>

            <main className="container mx-auto p-4 md:p-8">
                {/* Выносим заголовок и кнопку Share наверх для лучшей структуры */}
                <div className="flex flex-wrap gap-y-2 justify-between items-center mb-6">
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
                    {/* Левая колонка: Профиль и ключевые метрики */}
                    <div className="lg:col-span-1 space-y-6">
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
                                    <h2 className="text-2xl font-bold">
                                        {profileInfo.name}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        @{analysis.github_username}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    {profileInfo.bio || "No bio provided."}
                                </p>
                            </CardContent>
                        </Card>

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
                                />
                            )}
                            <StatCard
                                title="Repositories"
                                value={profileInfo.public_repos}
                                icon={<Book size={20} />}
                                // Передаем флаг для старта анимации
                                startAnimation={!isLoading}
                            />
                            <StatCard
                                title="Total Stars"
                                value={totalStars}
                                icon={<Star size={20} />}
                                // Передаем флаг для старта анимации
                                startAnimation={!isLoading}
                            />
                            <StatCard
                                title="Total Forks"
                                value={totalForks}
                                icon={<GitFork size={20} />}
                                // Передаем флаг для старта анимации
                                startAnimation={!isLoading}
                            />
                        </div>

                        {/* ДОБАВЛЯЕМ КАРТОЧКУ С ТОП-5 РЕПОЗИТОРИЯМИ */}
                        {topRepos && topRepos.length > 0 && (
                            <TopReposCard repos={topRepos} />
                        )}
                    </div>

                    {/* Правая колонка: График языков */}
                    <div className="lg:col-span-2 lg:sticky lg:top-8">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>
                                    Top Languages by Repository
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 sm:px-2 md:px-6">
                                {languages && languages.length > 0 ? (
                                    <LanguagesChart data={languages} />
                                ) : (
                                    <p>
                                        No public repositories with language
                                        data found.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
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
