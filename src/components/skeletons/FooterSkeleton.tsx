import { Skeleton } from "@/components/ui/skeleton";

export default function FooterSkeleton() {
    return (
        <footer className="w-full border-t">
            <div className="container mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-2">
                {/* Скелетон для левой части */}
                <Skeleton className="h-5 w-48" />
                {/* Скелетон для правой части */}
                <Skeleton className="h-4 w-64" />
            </div>
        </footer>
    );
}
