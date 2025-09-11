import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
    SessionContextProvider,
    useSessionContext,
} from "@supabase/auth-helpers-react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FooterSkeleton from "@/components/skeletons/FooterSkeleton";
import AnalysisSkeleton from "@/components/skeletons/AnalysisSkeleton";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { LoadingProvider, useLoading } from "@/context/LoadingContext";

// --- Внутренний компонент-обертка для layout, чтобы иметь доступ ко всем контекстам ---
function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    // Состояние для скелетона страницы анализа при ПЕРЕХОДЕ
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);

    // Получаем состояние глобальной загрузки из нашего нового контекста
    const { isGlobalLoading, setIsGlobalLoading } = useLoading(); // Получаем и функцию

    // --- Получаем состояние загрузки сессии ---
    const { isLoading: isSessionLoading } = useSessionContext();

    useEffect(() => {
        const handleStart = (url: string) => {
            // Включаем скелетон для анализа
            if (url.startsWith("/analysis/")) {
                setIsPageTransitioning(true);
            }
        };
        const handleComplete = () => {
            // Выключаем ОБА флага загрузки при завершении любого перехода
            setIsPageTransitioning(false);
            setIsGlobalLoading(false);
        };

        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleComplete);

        return () => {
            router.events.off("routeChangeStart", handleStart);
            router.events.off("routeChangeComplete", handleComplete);
            router.events.off("routeChangeError", handleComplete);
        };
    }, [router, setIsGlobalLoading]);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Хедер один на всё приложение */}
            <Header />
            <main className="flex-grow">
                {isPageTransitioning ? (
                    <AnalysisSkeleton />
                ) : (
                    // Компонент страницы (переданный как children) будет сам решать,
                    // показывать свой скелетон или нет (например, при прямой загрузке).
                    children
                )}
            </main>

            {/* --- Условный рендеринг футера --- */}
            {isSessionLoading ? (
                <FooterSkeleton />
            ) : (
                // Показываем реальный футер, только если нет глобальной загрузки
                !isGlobalLoading && <Footer />
            )}
        </div>
    );
}

export default function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());
    const [supabaseClient] = useState(() => createPagesBrowserClient());

    return (
        // --- ПРИМЕНЯЕМ ШРИФТЫ КО ВСЕМУ ПРИЛОЖЕНИЮ ---
        <div
            className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}
        >
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <SessionContextProvider
                    supabaseClient={supabaseClient}
                    initialSession={pageProps.initialSession}
                >
                    <QueryClientProvider client={queryClient}>
                        {/* Оборачиваем все в LoadingProvider */}
                        <LoadingProvider>
                            <AppLayout>
                                <Component {...pageProps} />
                            </AppLayout>
                        </LoadingProvider>
                        <Toaster />
                    </QueryClientProvider>
                </SessionContextProvider>
            </ThemeProvider>
        </div>
    );
}
