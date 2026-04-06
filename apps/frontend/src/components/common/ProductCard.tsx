import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
    data: Product;
};

const ProductCard = ({ data }: ProductCardProps) => {
    const finalPrice = data.discount.percentage > 0 
        ? data.price * (1 - data.discount.percentage / 100) 
        : data.discount.amount > 0 
        ? data.price - data.discount.amount 
        : data.price;

    return (
        <Link
            href={`/shop/product/${data.id}`}
            className="flex flex-col items-start aspect-auto group"
        >
            <div className="bg-[#F0EEED] rounded-[13px] lg:rounded-[20px] w-full lg:max-w-[295px] aspect-square mb-2.5 xl:mb-4 overflow-hidden relative">
                <Image
                    src={data.srcUrl}
                    width={295}
                    height={298}
                    className="rounded-md w-full h-full object-contain group-hover:scale-105 transition-all duration-500 bg-white"
                    alt={data.title}
                    priority
                />
            </div>
            <strong className="text-black xl:text-xl mb-1.5 group-hover:text-[#ff9900] transition-colors">{data.title}</strong>
            <div className="flex flex-wrap items-center gap-x-2">
                <span className="font-bold text-black text-xl xl:text-2xl uppercase">
                    {formatPrice(finalPrice)}
                </span>
                
                {(data.discount.percentage > 0 || data.discount.amount > 0) && (
                    <span className="font-bold text-black/30 line-through text-sm xl:text-lg uppercase">
                        {formatPrice(data.price)}
                    </span>
                )}
                
                {data.discount.percentage > 0 && (
                    <span className="font-medium text-[10px] xl:text-xs py-1 px-3 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                        {`-${data.discount.percentage}%`}
                    </span>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
