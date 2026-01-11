"use client";

import { ListBullets } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { TableOfContents } from "./table-of-contents";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export function MobileTocFab() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <motion.button
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center lg:hidden touch-manipulation"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open table of contents"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ListBullets size={24} weight="bold" />
        </motion.button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] overflow-hidden">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>On this page</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100%-60px)] pt-4 pb-8">
          <TableOfContents />
        </div>
      </SheetContent>
    </Sheet>
  );
}
