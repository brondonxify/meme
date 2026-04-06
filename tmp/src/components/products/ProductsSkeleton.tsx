import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search } from "lucide-react";

export function ProductsSkeleton() {
    return (
        <div className="flex flex-col bg-slate-950 min-h-screen">
            {/* Sticky Search Header Skeleton */}
            <div className="sticky top-16 z-40 w-full bg-slate-950/80 backdrop-blur border-b border-slate-800 py-4 shadow-xl">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="relative w-full sm:w-96">
                        <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters Skeleton */}
                <aside className="w-full md:w-64 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-slate-700" />
                        <Skeleton className="h-6 w-24" />
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-4 w-20" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-slate-900" />

                    <div className="space-y-4">
                        <Skeleton className="h-4 w-20" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Products Content Skeleton */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden p-0">
                                <Skeleton className="aspect-square w-full" />
                                <div className="p-5 space-y-3">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-10 w-full mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
