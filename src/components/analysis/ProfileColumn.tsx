import Link from "next/link";
import type { AnalysisData } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatCard from "@/components/analysis/StatCard";
import TopReposCard from "@/components/analysis/TopReposCard";
import { Star, GitFork, Users, Book, AlertCircle } from "lucide-react";
import { MotionDiv } from "@/components/ui/MotionDiv";

interface ProfileColumnProps {
    analysis: AnalysisData;
}

export default function ProfileColumn({ analysis }: ProfileColumnProps) {
    // Деструктурируем данные, чтобы было удобнее с ними работать
    const {
        profileInfo,
        totalStars,
        totalForks,
        topRepos,
        isPartial = false,
    } = analysis.stats_data;

    // Определяем, является ли профиль пользовательским, для условных ссылок
    const isUser = profileInfo.type === "User";
    const starsUrl = isUser
        ? `https://github.com/${analysis.github_username}?tab=stars`
        : `https://github.com/${analysis.github_username}`;

    return (
        <MotionDiv
            className="space-y-6"
            // Анимация для всей колонки
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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

            {isPartial && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 border rounded-lg bg-muted/50">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                        Note: Analysis is based on the 500 most recent
                        repositories.
                    </span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {profileInfo.followers > 0 && (
                    <StatCard
                        title="Followers"
                        value={profileInfo.followers}
                        icon={<Users size={20} />}
                        startAnimation={true}
                        href={`https://github.com/${analysis.github_username}?tab=followers`}
                    />
                )}
                <StatCard
                    title="Repositories"
                    value={profileInfo.public_repos}
                    icon={<Book size={20} />}
                    startAnimation={true}
                    href={`https://github.com/${analysis.github_username}?tab=repositories`}
                />
                <StatCard
                    title="Total Stars"
                    value={totalStars}
                    icon={<Star size={20} />}
                    startAnimation={true}
                    href={starsUrl}
                />
                <StatCard
                    title="Total Forks"
                    value={totalForks}
                    icon={<GitFork size={20} />}
                    startAnimation={true}
                    href={`https://github.com/${analysis.github_username}?tab=repositories`}
                />
            </div>

            {topRepos && topRepos.length > 0 && (
                <TopReposCard repos={topRepos} />
            )}
        </MotionDiv>
    );
}
