"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GithubLogo } from "@phosphor-icons/react";
import { MarioStar } from "./mario-star";
import { cn } from "../../lib/utils";

interface GitHubStarsProps {
  className?: string;
}

function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toString();
}

export function GitHubStars({ className }: GitHubStarsProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStars() {
      try {
        // Try to get from cache first
        const cached = sessionStorage.getItem("github-stars");
        const cachedTime = sessionStorage.getItem("github-stars-time");

        if (cached && cachedTime) {
          const cacheAge = Date.now() - parseInt(cachedTime, 10);
          // Use cache if less than 1 hour old
          if (cacheAge < 3600000) {
            setStars(parseInt(cached, 10));
            setIsLoading(false);
            return;
          }
        }

        const response = await fetch(
          "https://api.github.com/repos/yuribodo/mariocharts",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
            next: { revalidate: 3600 }, // ISR: revalidate every hour
          }
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        const starCount = data.stargazers_count;

        // Cache the result
        sessionStorage.setItem("github-stars", starCount.toString());
        sessionStorage.setItem("github-stars-time", Date.now().toString());

        setStars(starCount);
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error);
        // Fail silently - stars will just not show
      } finally {
        setIsLoading(false);
      }
    }

    fetchStars();
  }, []);

  return (
    <motion.a
      href="https://github.com/yuribodo/mariocharts"
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2",
        "text-sm font-medium transition-colors",
        "hover:bg-foreground/5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Stars count with Mario Star */}
      {!isLoading && stars !== null && (
        <motion.span
          className="flex items-center gap-1 text-foreground/70"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MarioStar size={14} />
          <span className="text-xs font-medium tabular-nums">
            {formatStars(stars)}
          </span>
        </motion.span>
      )}

      {/* GitHub icon */}
      <GithubLogo size={20} weight="fill" className="text-foreground" />

      <span className="sr-only">
        Star Mario Charts on GitHub{stars !== null ? ` (${stars} stars)` : ""}
      </span>
    </motion.a>
  );
}
