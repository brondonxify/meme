"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchProducts } from "@/services/products";
import type { BackendArticle } from "@/types/api";
import { cn, formatPrice } from "@/lib/utils";

const SearchDropdown = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSearch = searchParams.get("search") || "";

  const [query, setQuery] = useState(activeSearch);
  const [results, setResults] = useState<BackendArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const response = await fetchProducts({ search: debouncedQuery, limit: 5 });
        setResults(response.data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    // If we're on /shop with a search param, reset the page
    if (activeSearch) {
      router.push("/shop");
    }
  };

  return (
    <div className="relative hidden md:flex flex-1 max-w-[400px] lg:max-w-[500px] mr-3 lg:mr-10" ref={dropdownRef}>
      <div className="relative w-full group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search for products..."
          className="w-full bg-[#F0F0F0] rounded-full py-3 pl-12 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 placeholder:text-black/40 transition-all"
        />
        {query && (
          <button 
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (debouncedQuery.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-black/40">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-xs">Searching for products...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-black/40">Products</p>
              <div className="flex flex-col gap-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/product/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F0F0] transition-colors group"
                  >
                    <div className="relative size-12 shrink-0 bg-[#F3F3F3] rounded-lg overflow-hidden border border-black/5">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/20">
                          <Search size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate text-black">{product.name}</span>
                      <span className="text-xs text-black/60">{formatPrice(product.selling_price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                href={`/shop?search=${query}`}
                onClick={() => setIsOpen(false)}
                className="block text-center py-3 mt-1 text-xs font-bold text-black border-t border-black/5 hover:bg-[#F0F0F0] transition-colors"
              >
                View all results for &quot;{query}&quot;
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center text-black/40">
              <Search className="mx-auto mb-2 opacity-20" size={32} />
              <p className="text-sm">No products found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
