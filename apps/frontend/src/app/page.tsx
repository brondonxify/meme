import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import type { BackendArticle } from "@/types/api";
import type { Review } from "@/types/review.types";
import { fetchProducts } from "@/services/products";

export const reviewsData: Review[] = [
  {
    id: 1,
    user: "Alex K.",
    content:
      '"Finding tech that aligns with my professional needs used to be a challenge until I discovered Shop.co. The range of products they offer is truly remarkable, catering to various business requirements."',
    rating: 5,
    date: "August 14, 2023",
  },
  {
    id: 2,
    user: "Sarah M.",
    content: `"I'm blown away by the quality and performance of the devices I received from Shop.co. From business laptops to enterprise servers, every piece I've bought has exceeded my expectations."`,
    rating: 5,
    date: "August 15, 2023",
  },
  {
    id: 3,
    user: "Ethan R.",
    content: `"This scanner is a must-have for any modern office. The features and efficiency caught my eye, and the performance is perfect. I can see the quality in every aspect of this device."`,
    rating: 5,
    date: "August 16, 2023",
  },
  {
    id: 4,
    user: "Olivia P.",
    content: `"As an IT professional, I value performance and reliability. This laptop not only represents those principles but also boosts productivity. It's evident that the engineers poured their expertise into making this device stand out."`,
    rating: 5,
    date: "August 17, 2023",
  },
  {
    id: 5,
    user: "Liam K.",
    content: `"This workstation is a fusion of power and reliability. The specs are impressive, and the build quality speaks volumes about the manufacturer's skill. It's like having a powerhouse that reflects my passion for both technology and efficiency."`,
    rating: 5,
    date: "August 18, 2023",
  },
  {
    id: 6,
    user: "Samantha D.",
    content: `"I absolutely love this laptop! The specs are impressive and the performance is so reliable. As an IT specialist, I appreciate the attention to detail. It's become my favorite go-to device for all my projects."`,
    rating: 5,
    date: "August 19, 2023",
  },
];

function mapBackendToFrontendProduct(article: BackendArticle) {
  return {
    id: article.id,
    title: article.name,
    srcUrl: article.image_url || "/images/placeholder.png",
    gallery: article.image_url ? [article.image_url] : ["/images/placeholder.png"],
    price: article.selling_price,
    discount: {
      amount: 0,
      percentage: 0,
    },
    rating: 4.5,
  };
}

export default async function Home() {
  let newArrivalsData: ReturnType<typeof mapBackendToFrontendProduct>[] = [];
  let topSellingData: ReturnType<typeof mapBackendToFrontendProduct>[] = [];

  try {
    const result = await fetchProducts({ limit: 8 });
    const products = result.data || [];
    newArrivalsData = products.slice(0, 4).map(mapBackendToFrontendProduct);
    topSellingData = products.slice(4, 8).map(mapBackendToFrontendProduct);
  } catch (error) {
    // Silently handle - products will show as empty
  }

  return (
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop#top-selling"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>

        {/* Features Section - Tech Branding */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-frame mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 flex items-center justify-center bg-white shadow-sm rounded-2xl">
                <svg className="w-8 h-8 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h3 className="font-bold text-lg">Next-Day Delivery</h3>
              <p className="text-sm text-black/60">Get your tech gear fast with our expedited shipping options.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 flex items-center justify-center bg-white shadow-sm rounded-2xl">
                <svg className="w-8 h-8 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-bold text-lg">Secure Payments</h3>
              <p className="text-sm text-black/60">All transactions are encrypted and processed with maximum security.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 flex items-center justify-center bg-white shadow-sm rounded-2xl">
                <svg className="w-8 h-8 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-bold text-lg">Authentic Tech</h3>
              <p className="text-sm text-black/60">We source directly from manufacturers to guarantee authenticity.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 flex items-center justify-center bg-white shadow-sm rounded-2xl">
                <svg className="w-8 h-8 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="font-bold text-lg">24/7 Support</h3>
              <p className="text-sm text-black/60">Our technical support team is available around the clock.</p>
            </div>
          </div>
        </section>

        <Reviews data={reviewsData} />
      </main>
    </>
  );
}
