"use client";

import { categoriesService } from "@/services/categories.service";
import type { BackendCategory } from "@/types/api";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";

const DressStyleSection = () => {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesService.getAll();
        setCategories(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Accordion type="single" collapsible defaultValue="filter-style">
      <AccordionItem value="filter-style" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Dress Style
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          {loading ? (
            <div className="flex flex-col space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : error || categories.length === 0 ? (
            <div className="flex flex-col text-black/60 space-y-0.5">
              <span className="py-2 text-sm">No styles available</span>
            </div>
          ) : (
            <div className="flex flex-col text-black/60 space-y-0.5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?style=${category.slug}`}
                  className="flex items-center justify-between py-2"
                >
                  {category.name} <MdKeyboardArrowRight />
                </Link>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DressStyleSection;