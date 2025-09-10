import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";
// --- ИМПОРТИРУЕМ НАШИ ЦВЕТА ---
import { languageColors, defaultColor } from "@/data/languageColors";

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
                <div className="divide-y divide-border">
                    {repos.map((repo, index) => {
                        // Получаем цвет для языка из нашего объекта,
                        // или используем цвет по умолчанию, если язык не найден
                        const color =
                            languageColors[repo.language] || defaultColor;

                        return (
                            <div
                                key={index}
                                className="py-4 flex flex-col justify-center"
                            >
                                <div>
                                    <Link
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-primary hover:underline break-all"
                                    >
                                        {repo.name}
                                    </Link>
                                    <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">
                                        {repo.description || "\u00A0"}
                                    </p>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
                                    <span className="flex items-center gap-1">
                                        <Star
                                            size={16}
                                            className="text-yellow-500"
                                        />
                                        {repo.stars.toLocaleString()}
                                    </span>
                                    {repo.language !== "N/A" && (
                                        <span className="flex items-center gap-2">
                                            {/* Используем наш динамический цвет */}
                                            <span
                                                className="h-3 w-3 rounded-full"
                                                style={{
                                                    backgroundColor: color,
                                                }}
                                            />
                                            {repo.language}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
