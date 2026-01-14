"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, List } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/utils";
import { ThemeToggle } from "./theme-toggle";

interface MobileMenuProps {
  navigation: ReadonlyArray<{ name: string; href: string }>;
}

export function MobileMenu({ navigation }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const menuContent = isOpen ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "#FEFEFE",
        display: "flex",
        flexDirection: "column",
      }}
      className="dark:!bg-[#0A0A0A]"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          height: "56px",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid #E5E7EB",
        }}
        className="dark:!border-[#3A3A3A]"
      >
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        <span style={{ fontWeight: 600 }}>Mario Charts</span>

        <div style={{ width: "44px" }} />
      </div>

      {/* Navigation */}
      <nav style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              style={{
                display: "block",
                padding: "12px 16px",
                fontSize: "18px",
                fontWeight: 500,
                textDecoration: "none",
                borderRadius: "8px",
                color: isActive ? "#1A1D23" : "#718096",
                backgroundColor: isActive ? "#F5F6F7" : "transparent",
              }}
              className={cn(
                "dark:!text-[#FAFAFA]",
                isActive && "dark:!bg-[#2A2A2A]"
              )}
            >
              {item.name}
            </Link>
          );
        })}

        {/* GitHub link */}
        <a
          href="https://github.com/yuribodo/mariocharts"
          target="_blank"
          rel="noreferrer"
          onClick={() => setIsOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            fontSize: "18px",
            fontWeight: 500,
            textDecoration: "none",
            borderRadius: "8px",
            color: "#718096",
          }}
          className="dark:!text-[#A1A1AA]"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </nav>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          borderTop: "1px solid #E5E7EB",
        }}
        className="dark:!border-[#3A3A3A]"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", color: "#718096" }} className="dark:!text-[#A1A1AA]">
            Theme
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Menu trigger button */}
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2.5",
          "min-h-11 min-w-11 text-sm font-medium",
          "hover:bg-muted active:bg-muted",
          "md:hidden"
        )}
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-label="Open menu"
      >
        <List size={24} />
      </button>

      {/* Render menu in portal to escape any parent styling issues */}
      {mounted && menuContent && createPortal(menuContent, document.body)}
    </>
  );
}
