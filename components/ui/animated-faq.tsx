"use client";

import { useState } from "react";
import { Plus, Minus } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface AnimatedFAQProps {
  items: FAQItem[];
}

export function AnimatedFAQ({ items }: AnimatedFAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        
        return (
          <div
            key={index}
            className={cn(
              "group border rounded-lg overflow-hidden transition-all duration-200 ease-out",
              isOpen ? "shadow-sm" : "hover:shadow-sm"
            )}
          >
            <button
              onClick={() => toggleItem(index)}
              className={cn(
                "w-full p-6 text-left font-semibold transition-all duration-200 ease-out flex items-center justify-between group-hover:bg-muted/20",
                isOpen ? "bg-muted/10" : ""
              )}
            >
              <span className="text-base leading-relaxed">{item.question}</span>
              <div className={cn(
                "flex-shrink-0 ml-4 transition-transform duration-200 ease-out",
                isOpen ? "rotate-45 text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                <Plus size={20} />
              </div>
            </button>
            
            <div
              className={cn(
                "overflow-hidden transition-all duration-200 ease-out",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t bg-muted/5">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}