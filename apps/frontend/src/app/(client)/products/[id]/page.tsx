import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { ProductDetailSkeleton } from "@/components/products/ProductDetailSkeleton";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <div className="bg-white min-h-screen" style={{ paddingTop: '10px' }}>
            <div className="container mx-auto px-4">
                <Link href="/products">
                    <Button variant="link" className="text-[#007185] hover:text-[#c40000] p-0 mb-4 h-auto font-normal">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back to results
                    </Button>
                </Link>

                <Suspense fallback={<ProductDetailSkeleton />}>
                    <ProductDetailWrapper params={params} />
                </Suspense>
            </div>
        </div>
    );
}

async function ProductDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProductDetailClient id={id} />;
}
