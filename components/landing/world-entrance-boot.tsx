import { WORLD_ENTRANCE_SEEN_KEY } from "@/lib/world-entrance";

/**
 * Runs before first paint so `/` never flashes settled content while React
 * boots the Mario World entrance. Mirrors the gate in `useHeroEntrance`.
 */
export function WorldEntranceBootScript() {
  const code = `(function(){try{var p=location.pathname;if(p!=="/"&&p!=="")return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var nav=performance.getEntriesByType("navigation")[0];if(nav&&nav.type==="reload")sessionStorage.removeItem(${JSON.stringify(WORLD_ENTRANCE_SEEN_KEY)});else if(sessionStorage.getItem(${JSON.stringify(WORLD_ENTRANCE_SEEN_KEY)})==="1")return;document.documentElement.setAttribute("data-world-entering","");}catch(e){}})();`;

  return (
    <script
      // Blocking anti-FOUC boot — must stay inline and sync.
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
