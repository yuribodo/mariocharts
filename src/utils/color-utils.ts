import { tokens } from "@/themes/tokens";

export function getChartColor(index: number): string {
  const colors = Object.values(tokens.colors.chart).filter(Boolean);
  return colors[index % colors.length] || "#3B82F6";
}

export function getChartColors(count: number): readonly string[] {
  const allColors = Object.values(tokens.colors.chart);
  const colors: string[] = [];
  
  for (const color of allColors) {
    if (color) colors.push(color);
  }
  
  if (colors.length === 0) return Array(count).fill("#3B82F6");
  
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    if (color) result.push(color);
  }
  
  return result;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const sanitized = hex.replace("#", "");
  
  if (sanitized.length !== 6) return null;
  
  const r = parseInt(sanitized.substr(0, 2), 16) / 255;
  const g = parseInt(sanitized.substr(2, 2), 16) / 255;  
  const b = parseInt(sanitized.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number;
  let s: number;
  const l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  
  const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
  const x = c * (1 - Math.abs(((hDecimal * 6) % 2) - 1));
  const m = lDecimal - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  
  if (0 <= hDecimal && hDecimal < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= hDecimal && hDecimal < 2/6) {
    r = x; g = c; b = 0;
  } else if (2/6 <= hDecimal && hDecimal < 3/6) {
    r = 0; g = c; b = x;
  } else if (3/6 <= hDecimal && hDecimal < 4/6) {
    r = 0; g = x; b = c;
  } else if (4/6 <= hDecimal && hDecimal < 5/6) {
    r = x; g = 0; b = c;
  } else if (5/6 <= hDecimal && hDecimal < 1) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return "#" + [r, g, b]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}

export function adjustColorOpacity(color: string, opacity: number): string {
  if (color.startsWith("hsl(")) {
    return color.replace(")", ` / ${opacity})`);
  }
  
  if (color.startsWith("#")) {
    const hsl = hexToHsl(color);
    if (hsl) {
      return `hsl(${hsl.h} ${hsl.s}% ${hsl.l}% / ${opacity})`;
    }
  }
  
  return color;
}

export function generateColorPalette(
  baseColor: string,
  shades: number = 10
): readonly string[] {
  const hsl = baseColor.startsWith("#") ? hexToHsl(baseColor) : null;
  
  if (!hsl) return [baseColor];
  
  return Array.from({ length: shades }, (_, i) => {
    const lightness = Math.max(10, Math.min(90, hsl.l + (i - shades/2) * 10));
    return `hsl(${hsl.h} ${hsl.s}% ${lightness}%)`;
  });
}