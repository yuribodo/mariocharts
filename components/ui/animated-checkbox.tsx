"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  label,
  className,
  disabled = false,
  id,
  ...props
}: AnimatedCheckboxProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'>) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label 
      className={cn(
        "flex items-center space-x-2 cursor-pointer text-sm",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      htmlFor={id}
    >
      {/* Hidden native input for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        id={id}
        {...props}
      />
      
      {/* Animated checkbox */}
      <motion.div
        className={cn(
          "relative flex items-center justify-center w-4 h-4 border-2 rounded",
          checked 
            ? "bg-primary border-primary" 
            : "bg-transparent border-border hover:border-primary/50",
          disabled && "cursor-not-allowed"
        )}
        whileHover={!disabled ? { scale: 1.05 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {/* Checkmark */}
        <motion.svg
          className="w-3 h-3 text-primary-foreground"
          viewBox="0 0 16 16"
          fill="none"
          initial={false}
          animate={checked ? "checked" : "unchecked"}
        >
          <motion.path
            d="M13.5 3.5L6 11L2.5 7.5"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              unchecked: { pathLength: 0, opacity: 0 },
              checked: { pathLength: 1, opacity: 1 }
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </motion.svg>
      </motion.div>
      
      {/* Label */}
      {label && (
        <span className="select-none">
          {label}
        </span>
      )}
    </label>
  );
}