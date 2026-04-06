"use client";

import { categoriesService } from "@/services/categories.service";
import type { BackendCategory } from "@/types/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";

const CategoriesSection = () => {
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

  if (loading) {
    return (
      <div className="flex flex-col space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      <Link
        href="/shop"
        className="flex items-center justify-between py-2 font-semibold text-black"
      >
        All Categories <MdKeyboardArrowRight />
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/shop?category=${category.slug}`}
          className="flex items-center justify-between py-2 hover:text-black transition-colors"
        >
          {category.name} <MdKeyboardArrowRight />
        </Link>
      ))}
    </div>
  );
};

export default CategoriesSection;