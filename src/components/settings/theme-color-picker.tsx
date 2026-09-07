"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { THEME_COLOR_PRESETS } from "@/lib/theme"
import { updateThemeColorAction } from "@/app/(app)/configuracoes/actions"

export function ThemeColorPicker({ themeColor }: { themeColor: string }) {
  const [selected, setSelected] = useState(themeColor)
  const [isPending, startTransition] = useTransition()

  function apply(color: string) {
    setSelected(color)
    startTransition(async () => {
      try {
        await updateThemeColorAction(color)
        toast.success("Cor do tema atualizada.")
      } catch {
        toast.error("Não foi possível atualizar a cor do tema.")
        setSelected(themeColor)
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {THEME_COLOR_PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          disabled={isPending}
          onClick={() => apply(preset.value)}
          className="flex flex-col items-center gap-1"
          aria-label={preset.name}
        >
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-full border-2 transition-transform",
              selected === preset.value
                ? "scale-110 border-foreground"
                : "border-transparent"
            )}
            style={{ backgroundColor: preset.value }}
          >
            {selected === preset.value && (
              <Check className="size-4" style={{ color: "#fff" }} />
            )}
          </span>
          <span className="text-[11px] text-muted-foreground">{preset.name}</span>
        </button>
      ))}
      <label className="flex flex-col items-center gap-1">
        <input
          type="color"
          value={selected}
          disabled={isPending}
          onChange={(e) => apply(e.target.value)}
          className="size-9 cursor-pointer rounded-full border-2 border-transparent bg-transparent p-0"
          aria-label="Cor personalizada"
        />
        <span className="text-[11px] text-muted-foreground">Personalizada</span>
      </label>
    </div>
  )
}
