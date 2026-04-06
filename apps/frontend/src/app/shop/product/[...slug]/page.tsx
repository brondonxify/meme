import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { Product } from "@/types/product.types";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/products";
import type { BackendArticle } from "@/types/api";

function toProduct(article: BackendArticle): Product {
    return {
        id: article.id,
        title: article.name,
        srcUrl: article.image_url || "",
        price: article.selling_price,
        discount: { amount: 0, percentage: 0 },
        rating: 0,
        description: article.description || "",
        long_description: article.long_description || "",
        stock: article.stock,
        specifications: article.specifications || [],
        faqs: article.faqs || [],
        reviews: article.reviews || [],
    };
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;
    const slugParam = slug.join("/");
    console.log("Slug :", slugParam);

    let productData: Product | null = null;

    const article = await getProductBySlug(slugParam);
    console.log("Product", article);
    productData = toProduct(article);

    if (!productData) {
        notFound();
    }

    return (
        <main>
            <div className="max-w-frame mx-auto px-4 xl:px-0">
                <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
                <BreadcrumbProduct title={productData.title} />
                <section className="mb-11">
                    <Header data={productData} />
                </section>
                <Tabs
                    articleId={productData.id}
                    description={productData.description}
                    long_description={productData.long_description}
                    specifications={productData.specifications}
                    faqs={productData.faqs}
                    reviews={productData.reviews}
                />
            </div>
        </main>
    );
}
