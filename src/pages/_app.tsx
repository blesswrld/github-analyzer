import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AnalysisSkeleton from "@/components/skeletons/AnalysisSkeleton"; // Импортируем скелетон

// --- ИМПОРТИРУЕМ ШРИФТЫ ---
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export default function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());
    const [supabaseClient] = useState(() => createPagesBrowserClient());

    const router = useRouter();
    const [isPageLoading, setIsPageLoading] = useState(false);

    useEffect(() => {
        const handleStart = (url: string) => {
            // Показываем скелетон только для страниц анализа
            if (url.startsWith("/analysis/")) {
                setIsPageLoading(true);
            }
        };
        const handleComplete = () => {
            setIsPageLoading(false);
        };

        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleComplete);

        return () => {
            router.events.off("routeChangeStart", handleStart);
            router.events.off("routeChangeComplete", handleComplete);
            router.events.off("routeChangeError", handleComplete);
        };
    }, [router]);

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
                        <div className="flex flex-col min-h-screen">
                            {/* Хедер один на всё приложение */}
                            <Header />
                            <main className="flex-grow">
                                {isPageLoading ? (
                                    <AnalysisSkeleton />
                                ) : (
                                    /* Компонент страницы будет сам решать, показывать скелетон или нет */
                                    <Component {...pageProps} />
                                )}
                            </main>
                            <Footer />
                        </div>
                        <Toaster />
                    </QueryClientProvider>
                </SessionContextProvider>
            </ThemeProvider>
        </div>
    );
}
