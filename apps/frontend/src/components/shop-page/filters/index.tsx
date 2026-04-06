"use client";

import React, { useState } from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

const Filters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [priceRange, setPriceRange] = useState<number[]>([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "1000000")
  ]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", priceRange[0].toString());
    params.set("maxPrice", priceRange[1].toString());
    params.delete("page"); // Reset page on filter change
    router.push(`/shop?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/shop");
  };

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection />
      <hr className="border-t-black/10" />
      <PriceSection value={priceRange} onChange={setPriceRange} />
      <hr className="border-t-black/10" />

      <Button
        type="button"
        onClick={handleApply}
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12 hover:bg-black/80 transition-all mt-4"
      >
        Apply Filter
      </Button>
    </>
  );
};

export default Filters;
