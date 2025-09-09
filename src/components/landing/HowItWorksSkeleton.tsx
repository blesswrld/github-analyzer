import { Skeleton } from "@/components/ui/skeleton";

export function HowItWorksSkeleton() {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    );
}
