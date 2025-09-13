"use client"; // Добавляем эту директиву, так как useTheme - это клиентский хук

import Image from "next/image";
import { useTheme } from "next-themes";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";
import Link from "next/link";
import { LiveExampleSkeleton } from "../skeletons/landing/LiveExampleSkeleton";

// Добавляем проп isLoading
interface LiveExampleProps {
    isLoading?: boolean;
}

export function LiveExample({ isLoading }: LiveExampleProps) {
    const { theme } = useTheme();

    // Определяем, какое изображение показывать, на основе текущей темы
    // Указываем пути к вашим изображениям
    const imageSrc =
        theme === "dark"
            ? "/images/search-example-dark.jpg"
            : "/images/search-example-light.jpg";

    // Если isLoading === true, показываем скелетон
    if (isLoading) {
        return <LiveExampleSkeleton />;
    }

    return (
        // Оборачиваем все в Dialog
        <Dialog>
            <DialogTrigger asChild>
                <div className="border rounded-lg p-4 bg-muted/40 cursor-pointer hover:opacity-90 transition-opacity duration-300">
                    <Image
                        src={imageSrc}
                        alt="Example of a generated GitHub analysis dashboard"
                        width={1200}
                        height={800}
                        className="rounded-md shadow-lg"
                    />
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader className="sr-only">
                    <DialogTitle>Live Example Dashboard</DialogTitle>
                    <DialogDescription>
                        A preview of a generated GitHub analysis dashboard.
                        Click the zoom icon to see the full-size image.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative group">
                    {/* Внутри модального окна мы снова рендерим то же изображение, но браузер его возьмет из кэша. */}
                    <Image
                        src={imageSrc}
                        alt="Full-size example of a generated GitHub analysis dashboard"
                        width={1920}
                        height={957}
                        className="rounded-lg shadow-2xl w-full h-auto"
                    />
                    {/* Иконка лупы, которая является ссылкой на полное изображение */}
                    <Link
                        href={imageSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 p-2 bg-background/70 backdrop-blur-sm rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="View full-size image"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
