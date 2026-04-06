import { ProductsClient } from "@/components/products/ProductsClient";
import { Suspense } from "react";
import { ProductsSkeleton } from "@/components/products/ProductsSkeleton";

export default function ProductsPage() {
    return (
        <div className="flex flex-col bg-slate-950 min-h-screen">
            <Suspense fallback={<ProductsSkeleton />}>
                <ProductsClient />
            </Suspense>
        </div>
    );
}
