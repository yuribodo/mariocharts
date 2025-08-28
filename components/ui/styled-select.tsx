"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface StyledSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function StyledSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  className,
  disabled = false,
}: StyledSelectProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange(e.target.value);
  };

  return (
    <div className={cn("relative w-fit", className)}>
      {/* Native Select */}
      <motion.select
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={cn(
          // Base styles
          "appearance-none bg-transparent relative z-10",
          "px-2 py-1 pr-6 text-xs min-w-[80px] h-7",
          "rounded border border-input bg-background",
          "cursor-pointer",
          
          // Focus styles - no ring, just border
          "focus:outline-none focus:border-primary",
          
          // Hover styles
          "hover:bg-accent/30 hover:border-primary/50",
          
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background",
          
          // Smooth transitions
          "transition-all duration-200 ease-out"
        )}
        whileHover={!disabled ? { scale: 1.01 } : undefined}
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
      
      {/* Custom Chevron Icon */}
      <motion.div
        className={cn(
          "absolute right-1.5 top-1/2 -translate-y-1/2",
          "pointer-events-none flex items-center justify-center",
          "transition-transform duration-200",
          disabled && "opacity-50"
        )}
        animate={{ 
          rotate: isFocused ? 180 : 0
        }}
        transition={{ 
          duration: 0.2, 
          ease: "easeOut" 
        }}
      >
        <ChevronDown className="h-3 w-3 opacity-50" />
      </motion.div>
      
    </div>
  );
}