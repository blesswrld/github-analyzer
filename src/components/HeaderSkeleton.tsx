import { Skeleton } from "@/components/ui/skeleton";

export default function HeaderSkeleton() {
    return (
        <header className="container mx-auto flex justify-between items-center p-4 border-b">
            {/* Левая часть - название сайта */}
            <Skeleton className="h-7 w-48" />

            {/* Правая часть - скелетоны для кнопок */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-10 rounded-md" />
            </div>
        </header>
    );
}
