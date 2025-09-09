import { GetServerSidePropsContext } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import Header from "@/components/Header";
import LanguagesChart from "@/components/charts/LanguagesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, GitFork, Users, Book } from "lucide-react";
import Link from "next/link";

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
type AnalysisData = {
    github_username: string;
    stats_data: {
        profileInfo: ProfileInfo;
        languages: LanguageData[];
        totalStars: number;
        totalForks: number;
        mostStarredRepo: MostStarredRepo;
    };
};
type AnalysisPageProps = {
    analysis: AnalysisData | null;
};

export default function AnalysisPage({ analysis }: AnalysisPageProps) {
    if (!analysis) {
        return (
            <div>
                <Header />
                <main className="container mx-auto p-8 text-center">
                    <h1 className="text-4xl font-bold">Analysis Not Found</h1>
                    <p className="text-muted-foreground mt-2">
                        The requested analysis does not exist or may have been
                        deleted.
                    </p>
                </main>
            </div>
        );
    }

    const { profileInfo, totalStars, totalForks, mostStarredRepo, languages } =
        analysis.stats_data;

    return (
        <div>
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                    <h1 className="text-2xl font-bold">
                                        {profileInfo.name}
                                    </h1>
                                    <p className="text-muted-foreground">
                                        @{analysis.github_username}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{profileInfo.bio}</p>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Followers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold flex items-center gap-2">
                                        <Users size={20} />
                                        {profileInfo.followers.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Repositories
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold flex items-center gap-2">
                                        <Book size={20} />
                                        {profileInfo.public_repos.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Total Stars
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold flex items-center gap-2">
                                        <Star size={20} />
                                        {totalStars.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Total Forks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold flex items-center gap-2">
                                        <GitFork size={20} />
                                        {totalForks.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Most Starred Repository</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link
                                    href={mostStarredRepo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-primary hover:underline"
                                >
                                    {mostStarredRepo.name}
                                </Link>
                                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                    <Star size={16} />{" "}
                                    {mostStarredRepo.stars.toLocaleString()}{" "}
                                    stars
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Правая колонка: График языков */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>
                                    Top Languages by Repository
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
        </div>
    );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const { id } = ctx.params as { id: string };
    if (!id) return { props: { analysis: null } };

    const supabase = createPagesServerClient(ctx);

    const { data, error } = await supabase
        .from("analyses")
        .select("github_username, stats_data")
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
