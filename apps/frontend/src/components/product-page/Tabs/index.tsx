"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import ProductDetailsContent from "./ProductDetailsContent";
import ReviewsContent from "./ReviewsContent";
import FaqContent from "./FaqContent";

import type { FAQ, Review, Specification } from "@/types/product.types";

type TabBtn = {
  id: number;
  label: string;
};

const tabBtnData: TabBtn[] = [
  {
    id: 1,
    label: "Product Details",
  },
  {
    id: 2,
    label: "Reviews",
  },
  {
    id: 3,
    label: "FAQs",
  },
];

interface TabsProps {
  articleId: number;
  description?: string;
  long_description?: string;
  specifications?: Specification[];
  faqs?: FAQ[];
  reviews?: Review[];
}

const Tabs = ({ articleId, description, long_description, specifications, faqs, reviews }: TabsProps) => {
  const [active, setActive] = useState<number>(1);

  return (
    <div>
      <div className="flex items-center mb-6 sm:mb-8 overflow-x-auto">
        {tabBtnData.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            type="button"
            className={cn([
              active === tab.id
                ? "border-black border-b-2 font-medium"
                : "border-b border-black/10 text-black/60 font-normal",
              "p-5 sm:p-6 rounded-none flex-1 whitespace-nowrap",
            ])}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="mb-12 sm:mb-16">
        {active === 1 && <ProductDetailsContent description={long_description || description} specifications={specifications} />}
        {active === 2 && <ReviewsContent articleId={articleId} reviews={reviews} />}
        {active === 3 && <FaqContent faqs={faqs} />}
      </div>
    </div>
  );
};

export default Tabs;
