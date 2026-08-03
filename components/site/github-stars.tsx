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
  const [powered, setPowered] = useState(false);

  useEffect(() => {
    async function fetchStars() {
      try {
        const cached = sessionStorage.getItem("github-stars");
        const cachedTime = sessionStorage.getItem("github-stars-time");

        if (cached && cachedTime) {
          const cacheAge = Date.now() - parseInt(cachedTime, 10);
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
            next: { revalidate: 3600 },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        const starCount = data.stargazers_count as number;

        sessionStorage.setItem("github-stars", starCount.toString());
        sessionStorage.setItem("github-stars-time", Date.now().toString());

        setStars(starCount);
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStars();
  }, []);

  return (
    <a
      href="https://github.com/yuribodo/mariocharts"
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setPowered(true)}
      onMouseLeave={() => setPowered(false)}
      onFocus={() => setPowered(true)}
      onBlur={() => setPowered(false)}
      className={cn(
        "group inline-flex h-9 items-center gap-1.5 rounded-full px-2.5",
        "text-sm font-medium text-muted-foreground",
        "transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "touch-manipulation",
        className,
      )}
    >
      {!isLoading && stars !== null ? (
        <motion.span
          className="inline-flex items-center gap-1"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
        >
          <MarioStar size={18} powered={powered} />
          <span className="min-w-[1ch] text-xs font-semibold tabular-nums tracking-tight text-foreground/80 group-hover:text-foreground">
            {formatStars(stars)}
          </span>
        </motion.span>
      ) : (
        <MarioStar size={18} animate={false} />
      )}

      <span
        className="mx-0.5 h-3 w-px bg-foreground/12"
        aria-hidden="true"
      />

      <GithubLogo
        size={16}
        weight="fill"
        className="text-foreground/70 transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />

      <span className="sr-only">
        Star Mario Charts on GitHub
        {stars !== null ? ` (${stars} stars)` : ""}
      </span>
    </a>
  );
}
