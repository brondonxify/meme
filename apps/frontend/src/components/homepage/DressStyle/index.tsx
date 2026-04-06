"use client";

import { categoriesService } from "@/services/categories.service";
import type { BackendCategory } from "@/types/api";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import React, { useEffect, useState } from "react";
import * as motion from "framer-motion/client";
import DressStyleCard from "./DressStyleCard";

const DressStyle = () => {
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

  const getCardProps = (index: number, category: BackendCategory) => {
    const layouts = [
      {
        className:
          "md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm flex items-end",
      },
      {
        className:
          "md:max-w-[684px] h-[190px] bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm flex items-end",
      },
      {
        className:
          "md:max-w-[684px] h-[190px] bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm flex items-end",
      },
      {
        className:
          "md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm flex items-end",
      },
    ];
    return {
      title: category.name,
      url: `/shop?category=${category.slug}`,
      className: layouts[index % 4].className,
    };
  };

  if (loading) {
    return (
      <div className="px-4 xl:px-0">
        <section className="max-w-frame mx-auto bg-[#F0F0F0] px-6 pb-6 pt-10 md:p-[70px] rounded-[40px] text-center">
          <div className="h-12 w-64 mx-auto mb-14 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-col sm:flex-row md:h-[289px] space-y-4 sm:space-y-0 sm:space-x-5 mb-4 sm:mb-5">
            <div className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-gray-200 rounded animate-pulse" />
            <div className="md:max-w-[684px] h-[190px] bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row md:h-[289px] space-y-5 sm:space-y-0 sm:space-x-5">
            <div className="md:max-w-[684px] h-[190px] bg-gray-200 rounded animate-pulse" />
            <div className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-gray-200 rounded animate-pulse" />
          </div>
        </section>
      </div>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  const displayCategories = categories.slice(0, 4);

  return (
    <div className="px-4 xl:px-0">
      <section className="max-w-frame mx-auto bg-[#F0F0F0] px-6 pb-6 pt-10 md:p-[70px] rounded-[40px] text-center">
        <motion.h2
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={cn([
            integralCF.className,
            "text-[32px] leading-[36px] md:text-5xl mb-8 md:mb-14 capitalize",
          ])}
        >
          BROWSE BY CATEGORY
        </motion.h2>
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-4 sm:space-y-0 sm:space-x-5 mb-4 sm:mb-5"
        >
          {displayCategories.slice(0, 2).map((category, idx) => (
            <DressStyleCard
              key={category.id}
              {...getCardProps(idx, category)}
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-5 sm:space-y-0 sm:space-x-5"
        >
          {displayCategories.slice(2, 4).map((category, idx) => (
            <DressStyleCard
              key={category.id}
              {...getCardProps(idx + 2, category)}
            />
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default DressStyle;