import { Skeleton } from "@/components/ui/skeleton";
import { HowItWorksSkeleton } from "@/components/skeletons/landing/HowItWorksSkeleton";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";

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

            {/* --- Скелетон для Табов --- */}
            <div className="w-full max-w-4xl mt-12">
                <Tabs defaultValue="how-it-works">
                    {/* Скелетон для переключателей табов */}
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </TabsList>

                    {/* Показываем скелетон для первой вкладки по умолчанию */}
                    <TabsContent value="how-it-works" className="mt-6">
                        <HowItWorksSkeleton />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
