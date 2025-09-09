import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysisSkeleton() {
    return (
        <main className="container mx-auto p-4 md:p-8">
            {/* Верхняя часть: заголовок и кнопка */}
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-3/5" />
                <Skeleton className="h-10 w-24" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Левая колонка */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Карточка профиля */}
                    <div className="flex items-center gap-4 p-6 border rounded-lg">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>

                    {/* Карточки с метриками */}
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>

                    {/* Карточка самого популярного репозитория */}
                    <Skeleton className="h-24 w-full" />
                </div>

                {/* Правая колонка: график */}
                <div className="lg:col-span-2">
                    <Skeleton className="h-full min-h-[500px] w-full" />
                </div>
            </div>
        </main>
    );
}
