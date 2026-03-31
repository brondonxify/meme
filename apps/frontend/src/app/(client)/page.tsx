import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, Truck, HeadphonesIcon } from "lucide-react";
import { AuthSection } from "@/components/home/AuthSection";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-gray-200 py-12 lg:py-20 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>

        <div className="container relative mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 z-10">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Premium Tech, <span className="text-[#ff9900]">Delivered Fast.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
              Discover the latest hardware, smart home devices, and high-performance computing components at unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
              <Link href="/products">
                <Button size="lg" className="h-12 px-8 bg-[#f3a847] hover:bg-[#e29735] text-black font-bold text-base rounded-md transition-colors border border-[#a88734] shadow-sm">
                  Shop Now
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="h-12 px-8 bg-white border-gray-300 text-slate-700 hover:bg-gray-50 font-medium rounded-md shadow-sm">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md bg-white p-6 rounded-xl shadow-xl shadow-slate-200/50 border border-gray-100">
            <Suspense fallback={
              <div className="w-full space-y-4">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-48 w-full rounded-md" />
              </div>
            }>
              <AuthSection />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white shrink-0">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Truck className="h-8 w-8 text-[#ff9900]" />}
            title="Fast Delivery"
            desc="Fast & reliable shipping on all your orders."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 text-[#ff9900]" />}
            title="Secure Payments"
            desc="Your payment info is processed securely."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-[#ff9900]" />}
            title="Top Brands"
            desc="Authentic products directly from manufacturers."
          />
          <FeatureCard
            icon={<HeadphonesIcon className="h-8 w-8 text-[#ff9900]" />}
            title="24/7 Support"
            desc="Our customer service team is always here to help."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="h-16 w-16 flex items-center justify-center bg-gray-50 rounded-full mb-2">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
