import { Locator } from '@playwright/test';

/** WCAG relative-luminance contrast ratio, computed from live computed styles. */
export async function contrastRatio(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    function parseColor(str: string): [number, number, number] {
      const m = str.match(/\d+(\.\d+)?/g);
      if (!m) return [0, 0, 0];
      return [Number(m[0]), Number(m[1]), Number(m[2])];
    }
    function relLuminance([r, g, b]: [number, number, number]): number {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    function effectiveBackground(node: Element | null): [number, number, number] {
      let cur: Element | null = node;
      while (cur) {
        const bg = getComputedStyle(cur).backgroundColor;
        const [r, g, b, a] = (bg.match(/[\d.]+/g) || ['255', '255', '255', '1']).map(Number);
        if (a !== 0 && bg !== 'transparent') return [r, g, b];
        cur = cur.parentElement;
      }
      return [255, 255, 255];
    }
    const style = getComputedStyle(el);
    const fg = relLuminance(parseColor(style.color));
    const bg = relLuminance(effectiveBackground(el));
    const lighter = Math.max(fg, bg);
    const darker = Math.min(fg, bg);
    return (lighter + 0.05) / (darker + 0.05);
  });
}

export function isLargeText(fontSizePx: number, fontWeight: string | number): boolean {
  const weight = Number(fontWeight) || (fontWeight === 'bold' ? 700 : 400);
  return fontSizePx >= 24 || (fontSizePx >= 18.66 && weight >= 700);
}
