import type { CSSProperties } from "react"

export const THEME_COLOR_PRESETS = [
  { name: "Verde", value: "#16a34a" },
  { name: "Azul", value: "#2563eb" },
  { name: "Roxo", value: "#7c3aed" },
  { name: "Rosa", value: "#db2777" },
  { name: "Laranja", value: "#ea580c" },
  { name: "Vermelho", value: "#dc2626" },
  { name: "Ciano", value: "#0891b2" },
  { name: "Grafite", value: "#334155" },
]

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "")
  const bigint = parseInt(
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean,
    16
  )
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function readableForeground(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  // Relative luminance (perceptual) — decides whether black or white text
  // reads better on top of the household's chosen accent color.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? "#0a0a0a" : "#fafafa"
}

/**
 * Builds inline CSS custom properties that override the primary/accent
 * theme tokens with the household's chosen color, without touching the
 * rest of the shadcn palette (background, borders, etc. stay neutral).
 */
export function themeColorToStyle(hex: string): CSSProperties {
  const foreground = readableForeground(hex)
  return {
    "--primary": hex,
    "--primary-foreground": foreground,
    "--ring": hex,
    "--sidebar-primary": hex,
    "--sidebar-primary-foreground": foreground,
    "--sidebar-ring": hex,
    "--chart-1": hex,
  } as CSSProperties
}
