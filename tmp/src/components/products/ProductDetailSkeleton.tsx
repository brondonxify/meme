import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ProductDetailSkeleton() {
    return (
        <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image Skeleton */}
            <Skeleton className="aspect-square w-full rounded-3xl" />

            {/* Product Info Skeleton */}
            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>

                <div className="h-px bg-slate-900" />

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-14 flex-1 rounded-md" />
                        <Skeleton className="h-14 w-14 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}
