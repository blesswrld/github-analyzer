import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { useSessionContext } from "@supabase/auth-helpers-react";
import HomepageSkeleton from "@/components/skeletons/HomepageSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, Terminal, UserX, Dices } from "lucide-react";
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
import { popularProfiles } from "@/data/popularProfiles";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";

// Тип для ответа от нашего API
type AnalysisResponse = {
    analysisId: string;
    message?: string;
};

export default function HomePage() {
    // Получаем состояние загрузки сессии
    const { isLoading: isSessionLoading, session } = useSessionContext();
    // Получаем глобальное состояние загрузки и функцию для его изменения
    const { isGlobalLoading, setIsGlobalLoading } = useLoading();
    const user = session?.user;

    // Инициализируем username пустым, чтобы избежать мигания
    const [username, setUsername] = useState("");

    // --- СОСТОЯНИЯ ДЛЯ РЕЖИМА СРАВНЕНИЯ ---
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [opponentUsername, setOpponentUsername] = useState("microsoft");

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

    const { mutate, isPending, error, isError } = useMutation<
        AnalysisResponse,
        Error,
        string
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
        localStorage.setItem("hasSeenDefaultAnalyzerUsername", "true");

        setIsGlobalLoading(true); // Включаем загрузку для обоих случаев

        if (isCompareMode) {
            if (username.trim() && opponentUsername.trim()) {
                router.push(
                    `/compare/${username.trim()}-vs-${opponentUsername.trim()}`
                );
            } else {
                toast.error("Please enter both usernames for comparison.");
                setIsGlobalLoading(false); // Выключаем при ошибке валидации
            }
        } else {
            if (username.trim()) {
                mutate(username.trim());
            } else {
                toast.error("Please enter a username.");
                setIsGlobalLoading(false); // Выключаем при ошибке валидации
            }
        }
    };

    const handleSurpriseMe = () => {
        if (popularProfiles.length === 0) {
            toast.error("No profiles available.");
            return;
        }

        // Выбираем случайный профиль, который не равен текущему
        let randomProfile: string;

        if (popularProfiles.length === 1) {
            // если список из одного профиля
            randomProfile = popularProfiles[0];
        } else {
            // исключаем текущий username
            do {
                randomProfile =
                    popularProfiles[
                        Math.floor(Math.random() * popularProfiles.length)
                    ];
            } while (randomProfile === username);
        }

        // Устанавливаем его в поле ввода и сразу запускаем анализ
        setUsername(randomProfile);
        mutate(randomProfile);
    };

    // Показываем скелетон, пока сессия загружается
    if (isSessionLoading) {
        return <HomepageSkeleton />;
    }

    // Определяем, когда показывать основной скелетон
    const isLoading = isPending || isGlobalLoading;

    return (
        <main className="container mx-auto p-4 md:p-8 flex flex-col items-center">
            <div className="text-center max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    GitHub Profile Analyzer
                </h1>
                {/* Показываем подзаголовок, только если НЕТ загрузки */}
                {!isLoading && (
                    <p className="text-lg text-muted-foreground mb-8">
                        Enter a GitHub username to generate a shareable
                        dashboard of their coding stats and top projects.
                    </p>
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-4 mb-4"
            >
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <Input
                        placeholder="Enter username or org"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                    {isCompareMode && (
                        <>
                            <span className="text-muted-foreground font-bold hidden sm:block self-center">
                                vs
                            </span>
                            <Input
                                placeholder="Enter opponent"
                                value={opponentUsername}
                                onChange={(e) =>
                                    setOpponentUsername(e.target.value)
                                }
                                disabled={isLoading}
                            />
                        </>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {/* Текст зависит от общего состояния isLoading */}
                        {isLoading ? "Analyzing..." : "Analyze"}
                    </Button>
                </div>
            </form>

            {/* --- КНОПКИ УПРАВЛЕНИЯ (показываются, если нет загрузки) --- */}
            {!isLoading && (
                <div className="flex gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={handleSurpriseMe}
                        disabled={isLoading}
                    >
                        <Dices className="mr-2 h-4 w-4" /> Surprise Me!
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setIsCompareMode(!isCompareMode)}
                        disabled={isLoading}
                    >
                        {isCompareMode ? (
                            <UserX className="mr-2 h-4 w-4" />
                        ) : (
                            <PlusCircle className="mr-2 h-4 w-4" />
                        )}
                        {isCompareMode ? "Single Profile" : "Compare Profiles"}
                    </Button>
                </div>
            )}

            {/* Показываем скелетон на месте табов, если идет загрузка */}
            {isLoading && (
                <div className="w-full max-w-4xl mt-16">
                    <Skeleton className="h-10 w-full mb-6" />
                    <Skeleton className="h-40 w-full" />
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
            {!isLoading && (
                <div className="w-full max-w-4xl mt-16">
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
                            <TabsTrigger value="faq" className="cursor-pointer">
                                FAQ
                            </TabsTrigger>
                        </TabsList>

                        {/* --- ВЕРСИЯ ДЛЯ МОБИЛЬНЫХ (прячется на десктопах) --- */}
                        <div className="block md:hidden">
                            <Select
                                value={activeTab}
                                onValueChange={handleTabChange}
                            >
                                <SelectTrigger className="cursor-pointer">
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
    );
}
