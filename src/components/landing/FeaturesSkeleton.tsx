import { Skeleton } from "@/components/ui/skeleton";

export function FeaturesSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
        </div>
    );
}
