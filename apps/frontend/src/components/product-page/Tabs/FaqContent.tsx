import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { FAQ } from "@/types/product.types";

const fallbackFaqs: FAQ[] = [
  {
    question: "What are the technical specifications of this device?",
    answer: "Detailed specifications including processor, RAM, storage, display size, battery life, and connectivity options are managed in the product details section.",
  },
  {
    question: "What is the warranty period for this product?",
    answer: "Standard manufacturer warranty applies. Please check the documentation included in the box for specific coverage details.",
  },
];

const FaqContent = ({ faqs }: { faqs?: FAQ[] }) => {
  const displayFaqs = faqs && faqs.length > 0 ? faqs : fallbackFaqs;

  return (
    <section>
      <h3 className="text-xl sm:text-2xl font-bold text-black mb-5 sm:mb-6">
        Frequently asked questions
      </h3>
      <Accordion type="single" collapsible className="w-full">
        {displayFaqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx + 1}`}>
            <AccordionTrigger className="text-left py-4 hover:no-underline font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-black/60 leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FaqContent;
