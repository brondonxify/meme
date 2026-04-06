"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useProductUIStore } from "@/lib/store/productUIStore";
import { Product } from "@/types/product.types";

const AddToCartBtn = ({ data }: { data: Product & { quantity: number } }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const sizeSelection = useProductUIStore((state) => state.sizeSelection);
  const colorSelection = useProductUIStore((state) => state.colorSelection);

  return (
    <button
      type="button"
      className="bg-black w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all"
      onClick={() =>
        addToCart({
          id: data.id,
          name: data.title,
          srcUrl: data.srcUrl,
          price: data.price,
          attributes: [sizeSelection, colorSelection.name],
          discount: data.discount,
          quantity: data.quantity,
        })
      }
    >
      Add to Cart
    </button>
  );
};

export default AddToCartBtn;
