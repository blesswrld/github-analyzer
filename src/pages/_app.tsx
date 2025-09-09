import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";

export default function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());
    const [supabaseClient] = useState(() => createPagesBrowserClient());

    return (
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
                    {/* Хедер теперь один на всё приложение */}
                    <Header />
                    {/* Компонент страницы будет сам решать, показывать скелетон или нет */}
                    <Component {...pageProps} />
                    <Toaster />
                </QueryClientProvider>
            </SessionContextProvider>
        </ThemeProvider>
    );
}
