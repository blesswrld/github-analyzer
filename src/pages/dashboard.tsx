import { GetServerSidePropsContext } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import { useRouter } from "next/router";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// Тип для одного анализа из истории
type AnalysisHistoryItem = {
    id: string;
    github_username: string;
    created_at: string;
};

interface DashboardPageProps {
    analyses: AnalysisHistoryItem[];
    totalCount: number;
    currentPage: number;
    itemsPerPage: number;
}

export default function DashboardPage({
    analyses,
    totalCount,
    currentPage,
    itemsPerPage,
}: DashboardPageProps) {
    const router = useRouter();
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handlePageChange = (page: number) => {
        router.push(`/dashboard?page=${page}`);
    };

    const user = useUser();

    if (!user) {
        // Теоретически, сюда не должны попасть из-за защиты в getServerSideProps
        // Но лучше перестраховаться
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">
                    You must be logged in to view this page.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/">Go to Homepage</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>My Analyses - GitHub Profile Analyzer</title>
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-2xl md:text-4xl font-bold mb-6">
                    My Analyses
                </h1>

                {/* --- ПРИМЕЧАНИЕ (показывается, если список не пуст) --- */}
                {analyses.length > 0 && (
                    <p className="text-sm text-muted-foreground mb-2">
                        Showing up to the last 100 analyses.
                    </p>
                )}

                {analyses.length > 0 ? (
                    <div className="flex flex-col gap-y-4">
                        {analyses.map((analysis) => (
                            <Link
                                key={analysis.id}
                                href={`/analysis/${analysis.id}`}
                            >
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardHeader>
                                        <CardTitle>
                                            {analysis.github_username}
                                        </CardTitle>
                                        <CardDescription>
                                            Analyzed on:{" "}
                                            {new Date(
                                                analysis.created_at
                                            ).toLocaleString()}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center border-2 border-dashed rounded-lg p-12">
                        <h2 className="text-xl font-semibold">
                            No analyses yet
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Go to the homepage to analyze a profile. Your
                            history will appear here.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/">Analyze a Profile</Link>
                        </Button>
                    </div>
                )}
                {/* --- БЛОК ПАГИНАЦИИ --- */}
                {totalPages > 1 && (
                    <Pagination className="mt-8">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage - 1);
                                    }}
                                    className={
                                        currentPage === 1
                                            ? "pointer-events-none opacity-50"
                                            : undefined
                                    }
                                />
                            </PaginationItem>

                            {/* Логика для отображения номеров страниц */}
                            <PaginationItem>
                                <PaginationLink isActive>
                                    {currentPage}
                                </PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage + 1);
                                    }}
                                    className={
                                        currentPage === totalPages
                                            ? "pointer-events-none opacity-50"
                                            : undefined
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </>
    );
}

// Защищаем страницу и загружаем данные на сервере
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const supabase = createPagesServerClient(ctx);

    // Получаем сессию
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Если сессии нет, перенаправляем на главную
    if (!session) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    // --- ЛОГИКА ПАГИНАЦИИ ---
    const currentPage = parseInt(ctx.query.page as string) || 1;
    const itemsPerPage = 10;
    const offset = (currentPage - 1) * itemsPerPage;

    // Получаем общее количество анализов для этого пользователя
    const { count, error: countError } = await supabase
        .from("analyses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

    // Если сессия есть, получаем историю анализов для этого пользователя
    const { data: analyses, error: dataError } = await supabase
        .from("analyses")
        .select("id, github_username, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

    if (countError || dataError) {
        console.error("Error fetching analyses:", countError || dataError);
    }

    return {
        props: {
            analyses: analyses || [],
            totalCount: count || 0,
            currentPage,
            itemsPerPage,
        },
    };
};
