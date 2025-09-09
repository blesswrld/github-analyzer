import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
    const supabaseClient = useSupabaseClient();
    const user = useUser();

    const handleLogin = async () => {
        await supabaseClient.auth.signInWithOAuth({
            provider: "github",
        });
    };

    const handleLogout = async () => {
        await supabaseClient.auth.signOut();
    };

    return (
        <header className="container mx-auto flex justify-between items-center p-4 border-b">
            <Link href="/" className="text-xl md:text-2xl font-bold">
                GitHub Analyzer
            </Link>

            <div className="flex items-center gap-4">
                {/* Если пользователь не залогинен, показываем кнопку входа */}
                {!user && (
                    <Button onClick={handleLogin}>Login with GitHub</Button>
                )}

                {/* Если пользователь залогинен, показываем его аватар и выпадающее меню */}
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-8 w-8 rounded-full"
                            >
                                <Avatar className="h-8 w-8">
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
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
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
