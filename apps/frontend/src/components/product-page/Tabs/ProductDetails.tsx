import React from "react";
import type { Specification } from "@/types/product.types";

const defaultSpecs: Specification[] = [
  {
    key: "Material composition",
    value: "100% Cotton",
  },
  {
    key: "Care instructions",
    value: "Machine wash warm, tumble dry",
  },
  {
    key: "Fit type",
    value: "Classic Fit",
  },
  {
    key: "Pattern",
    value: "Solid",
  },
];

interface ProductDetailsProps {
  specifications?: Specification[];
}

const ProductDetails = ({ specifications }: ProductDetailsProps) => {
  const specs = specifications && specifications.length > 0
    ? specifications
    : defaultSpecs;

  return (
    <>
      {specs.map((item, i) => (
        <div className="grid grid-cols-3" key={i}>
          <div>
            <p className="text-sm py-3 w-full leading-7 lg:py-4 pr-2 text-neutral-500">
              {item.key}
            </p>
          </div>
          <div className="col-span-2 py-3 lg:py-4 border-b">
            <p className="text-sm w-full leading-7 text-neutral-800 font-medium">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductDetails;
