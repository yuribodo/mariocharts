"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChartBar, GithubLogo, List, X } from "@phosphor-icons/react";
import { useState } from "react";

import { cn } from "../../lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { name: "Docs", href: "/docs" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ChartBar size={24} weight="duotone" />
              </motion.div>
              <span className="hidden font-bold sm:inline-block">
                Mario Charts
              </span>
            </Link>
          </motion.div>
          
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item, index) => {
              const isActive = pathname?.startsWith(item.href);
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.1 }}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "transition-colors hover:text-foreground/80 relative py-2",
                      isActive ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeNavItem"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Mobile menu button */}
        <motion.button
          className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <span className="sr-only">Open main menu</span>
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} aria-hidden="true" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <List size={24} aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Mobile logo */}
        <div className="flex md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <ChartBar size={20} weight="duotone" />
            <span className="font-bold">Mario Charts</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search will go here */}
          </div>
          <motion.nav 
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="https://github.com/yuribodo/mariocharts"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
              >
                <GithubLogo size={16} weight="fill" />
                <span className="sr-only">GitHub</span>
              </Link>
            </motion.div>
          </motion.nav>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.1 }}
          >
            <motion.div 
              className="space-y-1 border-t px-2 pb-3 pt-2 shadow-lg"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
            >
              {navigation.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.1 + 0.2 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground",
                      pathname?.startsWith(item.href)
                        ? "bg-muted text-muted-foreground"
                        : "text-foreground"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}