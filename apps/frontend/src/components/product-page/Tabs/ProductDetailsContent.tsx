import React from "react";
import ProductDetails from "./ProductDetails";
import type { Specification } from "@/types/product.types";

interface ProductDetailsContentProps {
  description?: string;
  specifications?: Specification[];
}

const ProductDetailsContent = ({ description, specifications }: ProductDetailsContentProps) => {
  return (
    <section>
      <h3 className="text-xl sm:text-2xl font-bold text-black mb-5 sm:mb-6">
        Product specifications
      </h3>
      <ProductDetails specifications={specifications} />
    </section>
  );
};

export default ProductDetailsContent;
