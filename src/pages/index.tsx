import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { useSessionContext } from "@supabase/auth-helpers-react";
import HomepageSkeleton from "@/components/skeletons/HomepageSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { LiveExample } from "@/components/landing/LiveExample";
import { FAQ } from "@/components/landing/FAQ";
import { Dices } from "lucide-react"; // Иконка для кнопки
import { popularProfiles } from "@/data/popularProfiles"; // Импортируем массив
import { useLoading } from "@/context/LoadingContext";

// Тип для ответа от нашего API
type AnalysisResponse = {
    analysisId: string;
    message?: string;
};

export default function HomePage() {
    // Получаем состояние загрузки сессии
    const { isLoading: isSessionLoading, session } = useSessionContext();
    const user = session?.user;

    // Инициализируем username пустым, чтобы избежать мигания
    const [username, setUsername] = useState("");
    const router = useRouter();

    // --- СОСТОЯНИЕ ДЛЯ УПРАВЛЕНИЯ ТАБАМИ ---
    const [activeTab, setActiveTab] = useState("how-it-works");

    // --- Читаем хеш при загрузке ---
    useEffect(() => {
        // Этот эффект отвечает за установку активного таба из URL
        const hash = window.location.hash.replace("#", "");
        const validTabs = ["how-it-works", "features", "example", "faq"];
        if (hash && validTabs.includes(hash)) {
            setActiveTab(hash);
        }
    }, []); // Пустой массив зависимостей, чтобы сработал только один раз при монтировании

    // useEffect для установки username после загрузки сессии
    useEffect(() => {
        // Этот эффект выполняется только на клиенте
        if (!isSessionLoading) {
            // Проверяем, видел ли пользователь дефолтное значение раньше
            const hasSeenDefault = localStorage.getItem(
                "hasSeenDefaultAnalyzerUsername"
            );

            if (!hasSeenDefault) {
                // Если не видел, устанавливаем дефолтное значение
                const defaultUsername =
                    user?.user_metadata?.user_name || "facebook";
                setUsername(defaultUsername);
                // И сразу же ставим флаг, что он его увидел
                localStorage.setItem("hasSeenDefaultAnalyzerUsername", "true");
            }
            // Если флаг уже стоит, ничего не делаем, и useState("") оставит поле пустым.
        }
    }, [isSessionLoading, user]);

    const { setIsGlobalLoading } = useLoading(); // Получаем функцию для управления состоянием

    const { mutate, isPending, error, isError } = useMutation<
        AnalysisResponse,
        Error,
        string // мутация принимает просто строку
    >({
        mutationFn: async (usernameToAnalyze: string) => {
            const response = await fetch(
                `/api/github-stats/${usernameToAnalyze}`,
                {
                    method: "POST", // POST оставляем, он ничего не ломает
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "An unknown error occurred.");
            }
            return data;
        },
        // --- КОЛЛБЭКИ ---
        onSuccess: (data) => {
            router.push(`/analysis/${data.analysisId}`);
        },
        onMutate: () => {
            setIsGlobalLoading(true); // Включаем глобальную загрузку ПЕРЕД запросом
        },
        onSettled: () => {
            setIsGlobalLoading(false); // Выключаем ПОСЛЕ запроса (при успехе или ошибке)
        },
    });

    // --- Обновляем хеш при смене таба ---
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Обновляем URL, не перезагружая страницу
        router.push(`/#${value}`, undefined, { shallow: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            // Когда пользователь что-то анализирует, мы также можем считать, что он
            // уже "использовал" приложение, и больше не показывать ему дефолтное значение.
            localStorage.setItem("hasSeenDefaultAnalyzerUsername", "true");
            mutate(username.trim());
        }
    };

    const handleSurpriseMe = () => {
        // Выбираем случайный профиль, который не равен текущему
        let randomProfile = username;
        while (randomProfile === username) {
            randomProfile =
                popularProfiles[
                    Math.floor(Math.random() * popularProfiles.length)
                ];
        }

        // Устанавливаем его в поле ввода и сразу запускаем анализ
        setUsername(randomProfile);
        mutate(randomProfile);
    };

    // Показываем скелетон, пока сессия загружается
    if (isSessionLoading) {
        return <HomepageSkeleton />;
    }

    // Когда загрузка сессии завершена, показываем основной контент
    return (
        <>
            <main className="container mx-auto p-6 md:p-8 flex flex-col items-center">
                <div className="text-center max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
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
                        placeholder="Enter a GitHub username or organization"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isPending}
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Analyzing..." : "Analyze"}
                    </Button>
                </form>

                {/* --- Кнопка Surprise Me! --- */}
                <Button
                    variant="ghost"
                    onClick={handleSurpriseMe}
                    disabled={isPending}
                    className="mb-8"
                >
                    <Dices className="mr-2 h-4 w-4" />
                    Surprise Me!
                </Button>

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

                {/* Показываем табы, только если НЕТ загрузки */}
                {!isPending && (
                    <div className="w-full max-w-4xl mt-16">
                        {/* Мы используем value и onValueChange, чтобы контролировать состояние */}
                        <Tabs
                            value={activeTab}
                            onValueChange={handleTabChange}
                            className="w-full"
                        >
                            {/* --- ВЕРСИЯ ДЛЯ ДЕСКТОПОВ (прячется на мобильных) --- */}
                            <TabsList className="hidden md:grid w-full grid-cols-4">
                                <TabsTrigger
                                    value="how-it-works"
                                    className="cursor-pointer"
                                >
                                    How It Works
                                </TabsTrigger>
                                <TabsTrigger
                                    value="features"
                                    className="cursor-pointer"
                                >
                                    Features
                                </TabsTrigger>
                                <TabsTrigger
                                    value="example"
                                    className="cursor-pointer"
                                >
                                    Live Example
                                </TabsTrigger>
                                <TabsTrigger
                                    value="faq"
                                    className="cursor-pointer"
                                >
                                    FAQ
                                </TabsTrigger>
                            </TabsList>

                            {/* --- ВЕРСИЯ ДЛЯ МОБИЛЬНЫХ (прячется на десктопах) --- */}
                            <div className="block md:hidden">
                                <Select
                                    value={activeTab}
                                    onValueChange={handleTabChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a section..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="how-it-works">
                                            How It Works
                                        </SelectItem>
                                        <SelectItem value="features">
                                            Features
                                        </SelectItem>
                                        <SelectItem value="example">
                                            Live Example
                                        </SelectItem>
                                        <SelectItem value="faq">FAQ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <TabsContent value="how-it-works" className="mt-6">
                                <HowItWorks />
                            </TabsContent>
                            <TabsContent value="features" className="mt-6">
                                <Features />
                            </TabsContent>
                            <TabsContent value="example" className="mt-6">
                                <LiveExample />
                            </TabsContent>
                            <TabsContent value="faq" className="mt-6">
                                <FAQ />
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </main>
        </>
    );
}
