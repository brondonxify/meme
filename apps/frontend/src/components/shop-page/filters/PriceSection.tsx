import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

const PriceSection = ({ value, onChange }: { value: number[]; onChange: (val: number[]) => void }) => {
  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            value={value}
            onValueChange={onChange}
            min={0}
            max={1000000}
            step={1000}
            label=" XAF"
          />
          <div className="flex items-center justify-between mt-2 text-sm text-black/60">
             <span>{value[0].toLocaleString()} XAF</span>
             <span>{value[1].toLocaleString()} XAF</span>
          </div>
          <div className="mb-3" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
