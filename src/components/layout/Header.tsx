import {
    useSupabaseClient,
    useSessionContext,
} from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router"; // Импортируем useRouter
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
    const supabaseClient = useSupabaseClient();
    // Получаем состояние загрузки и саму сессию
    const { isLoading, session } = useSessionContext();
    const user = session?.user;

    // Получаем текущий путь страницы
    const router = useRouter();
    const isHomePage = router.pathname === "/";

    const handleLogin = async () => {
        await supabaseClient.auth.signInWithOAuth({ provider: "github" });
    };

    const handleLogout = async () => {
        await supabaseClient.auth.signOut();
    };

    // Скелетон для состояния загрузки
    if (isLoading) {
        return (
            <header className="container mx-auto flex justify-between items-center p-4 h-20">
                {/* Показываем скелетон заголовка, если это не главная страница */}
                {!isHomePage && <Skeleton className="h-7 w-48" />}
                <div className="flex items-center gap-4 ml-auto">
                    {/* ml-auto для прижатия вправо */}
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </header>
        );
    }

    // Когда проверка завершена, показываем реальный хедер
    return (
        <header className="container mx-auto flex justify-between items-center p-4 border-b">
            {/* Показываем заголовок-ссылку только если мы НЕ на главной странице. */}
            {!isHomePage ? (
                <Link href="/" className="text-xl md:text-1xl font-bold">
                    GitHub Analyzer
                </Link>
            ) : (
                // Если мы на главной, оставляем пустое место, чтобы кнопки были справа
                <div />
            )}

            <div className="flex items-center gap-4">
                {/* Если пользователь не залогинен, показываем кнопку входа */}
                {!user ? (
                    <Button onClick={handleLogin}>Login with GitHub</Button>
                ) : (
                    /* Если пользователь залогинен, показываем его аватар и выпадающее меню */
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-8 w-8 rounded-full"
                            >
                                <Avatar className="h-8 w-8 cursor-pointer">
                                    <AvatarImage
                                        src={user.user_metadata?.avatar_url}
                                        alt={user.user_metadata?.user_name}
                                    />
                                    <AvatarFallback>
                                        {user.user_metadata?.user_name
                                            ?.substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {user.user_metadata?.user_name || "My Account"}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                            >
                                <Link href="/dashboard">My Analyses</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Переключатель темы всегда виден */}
                <ThemeToggle />
            </div>
        </header>
    );
}
