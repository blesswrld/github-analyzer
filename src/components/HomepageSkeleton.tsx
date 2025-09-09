import { Skeleton } from "@/components/ui/skeleton";

export default function HomepageSkeleton() {
    return (
        <main className="container mx-auto p-4 md:p-8 flex flex-col items-center">
            <div className="text-center max-w-2xl">
                {/* Скелетон для заголовка */}
                <Skeleton className="h-10 md:h-12 w-4/5 mx-auto mb-4" />
                <Skeleton className="h-10 md:h-12 w-3/5 mx-auto mb-4" />

                {/* Скелетон для подзаголовка */}
                <Skeleton className="h-6 w-full mx-auto mb-8" />
            </div>

            {/* Скелетон для формы */}
            <div className="w-full max-w-sm flex gap-2 mb-8">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-24" />
            </div>
        </main>
    );
}
