import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import type { AnalysisData } from "@/types";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import ProfileColumn from "@/components/analysis/ProfileColumn";
import CompareLanguagesChart from "@/components/charts/CompareLanguagesChart"; // Убедитесь, что этот компонент импортирован
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Определяем пропсы для страницы сравнения
interface ComparePageProps {
    analysis1: AnalysisData | null;
    analysis2: AnalysisData | null;
}

// Экспортируем компонент страницы, а не ProfileColumn
export default function ComparePage({
    analysis1,
    analysis2,
}: ComparePageProps) {
    // Простой экран ошибки, если один из профилей не найден
    if (!analysis1 || !analysis2) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold">Profile Not Found</h1>
                <p className="text-muted-foreground mt-2">
                    One of the profiles could not be found. Please ensure both
                    usernames are correct and have been analyzed before.
                </p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>
                    Comparing {analysis1.github_username} vs{" "}
                    {analysis2.github_username}
                </title>
                <meta
                    name="description"
                    content={`Side-by-side comparison of GitHub statistics for ${analysis1.github_username} and ${analysis2.github_username}.`}
                />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                {/* Заголовок */}
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                    {analysis1.github_username}{" "}
                    <span className="text-muted-foreground">vs</span>{" "}
                    {analysis2.github_username}
                </h1>

                {/* Двухколоночная верстка */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <ProfileColumn analysis={analysis1} />
                    <ProfileColumn analysis={analysis2} />
                </div>

                {/* Общий график */}
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Languages Comparison</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 sm:px-2 md:px-6">
                            <CompareLanguagesChart
                                data1={analysis1.stats_data.languages}
                                data2={analysis2.stats_data.languages}
                                name1={analysis1.github_username}
                                name2={analysis2.github_username}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

// Загружаем данные для обоих профилей на сервере
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const slug = ctx.params?.slug as string;
    const [username1, username2] = slug ? slug.split("-vs-") : [null, null];

    if (!username1 || !username2) {
        return { props: { analysis1: null, analysis2: null } };
    }

    const supabase = createPagesServerClient(ctx);

    // Ищем уже готовые анализы в базе данных
    const fetchAnalysis = async (username: string) => {
        // Ищем по имени без учета регистра
        const { data } = await supabase
            .from("analyses")
            .select("id, github_username, stats_data")
            .ilike("github_username", username) // ilike для поиска без учета регистра
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        return data as AnalysisData | null;
    };

    // Выполняем запросы параллельно
    const [analysis1, analysis2] = await Promise.all([
        fetchAnalysis(username1),
        fetchAnalysis(username2),
    ]);

    // Если одного из анализов нет, можно было бы запускать анализ на лету,
    // но для простоты пока будем считать, что они уже должны существовать.

    return { props: { analysis1, analysis2 } };
};
