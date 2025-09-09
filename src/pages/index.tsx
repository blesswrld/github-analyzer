import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Тип для ответа от нашего API
type AnalysisResponse = {
    analysisId: string;
    message?: string; // Для сообщений об ошибках
};

export default function HomePage() {
    const [username, setUsername] = useState("gaearon");
    const router = useRouter();

    // 'isPending'
    const { mutate, isPending, error, isError } = useMutation<
        AnalysisResponse,
        Error,
        string
    >({
        mutationFn: async (usernameToAnalyze: string) => {
            const response = await fetch(
                `/api/github-stats/${usernameToAnalyze}`,
                {
                    method: "POST",
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "An unknown error occurred.");
            }
            return data;
        },
        onSuccess: (data) => {
            router.push(`/analysis/${data.analysisId}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            mutate(username.trim());
        }
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto p-4 md:p-8 flex flex-col items-center">
                <div className="text-center max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        GitHub Profile Analyzer
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Enter a GitHub username to generate a shareable
                        dashboard of their coding stats and top projects.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm flex gap-2 mb-8"
                >
                    {/* Используем isPending */}
                    <Input
                        type="text"
                        placeholder="e.g., torvalds"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isPending}
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Analyzing..." : "Analyze"}
                    </Button>
                </form>

                {/* Используем isPending */}
                {isPending && (
                    <div className="w-full max-w-4xl space-y-4">
                        <Skeleton className="h-12 w-1/3" />
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                )}

                {isError && (
                    <Alert variant="destructive" className="w-full max-w-sm">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error?.message || "Failed to analyze profile."}
                        </AlertDescription>
                    </Alert>
                )}
            </main>
        </div>
    );
}
