"use client"; // Добавляем эту директиву, так как useTheme - это клиентский хук

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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

export function LiveExample() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Этот хук гарантирует, что компонент будет отрендерен на клиенте
    // перед тем, как мы попытаемся получить доступ к теме.
    // Это предотвращает ошибки гидратации (mismatch).
    useEffect(() => {
        setMounted(true);
    }, []);

    // Определяем, какое изображение показывать, на основе текущей темы
    // Указываем пути к вашим изображениям
    const imageSrc =
        theme === "dark"
            ? "/images/search-example-dark.jpg"
            : "/images/search-example-light.jpg";

    // Пока компонент не смонтирован, можно ничего не показывать или показать скелетон
    if (!mounted) {
        return (
            <div className="border rounded-lg p-4 bg-muted/40">
                <div className="aspect-[3/2] w-full bg-muted rounded-md shadow-lg" />
            </div>
        );
    }

    return (
        // Оборачиваем все в Dialog
        <Dialog>
            <DialogTrigger asChild>
                <div className="border rounded-lg p-4 bg-muted/40 cursor-pointer hover:opacity-90 transition-opacity">
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
