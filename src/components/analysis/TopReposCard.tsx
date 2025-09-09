import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";

// Определяем тип для одного репозитория
type Repo = {
    name: string;
    url: string;
    stars: number;
    description: string;
    language: string;
};

interface TopReposCardProps {
    repos: Repo[];
}

export default function TopReposCard({ repos }: TopReposCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Repositories</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {repos.map((repo, index) => (
                        <div key={index}>
                            <Link
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-primary hover:underline break-all"
                            >
                                {repo.name}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                                {repo.description}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
                                <span className="flex items-center gap-1">
                                    <Star
                                        size={16}
                                        className="text-yellow-500"
                                    />
                                    {repo.stars.toLocaleString()}
                                </span>
                                {repo.language !== "N/A" && (
                                    <span className="flex items-center gap-1">
                                        <span className="h-3 w-3 rounded-full bg-sky-500" />{" "}
                                        {/* Цвет можно сделать динамическим */}
                                        {repo.language}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
