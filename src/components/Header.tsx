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
            <Link href="/" className="text-2xl font-bold">
                GitHub Analyzer
            </Link>
            <div>
                {!user ? (
                    <Button onClick={handleLogin}>Login with GitHub</Button>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar>
                                <AvatarImage
                                    src={user.user_metadata?.avatar_url}
                                />
                                <AvatarFallback>
                                    {user.user_metadata?.user_name?.substring(
                                        0,
                                        2
                                    )}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
