"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppearance } from "@/hooks/use-appearance"

export function ModeToggle() {
    const { appearance, updateAppearance } = useAppearance()

    // --- alternar entre dark/light ---
    const toggleTheme = () => {
        const nextTheme = appearance === "dark" ? "light" : "dark"
        updateAppearance(nextTheme)
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={toggleTheme}
        >
            {/* Sol (modo claro) */}
            <Sun
                className={`h-[1.2rem] w-[1.2rem] transition-all ${appearance === "dark"
                        ? "scale-0 -rotate-90 opacity-0"
                        : "scale-100 rotate-0 opacity-100"
                    }`}
            />

            {/* Luna (modo oscuro) */}
            <Moon
                className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${appearance === "dark"
                        ? "scale-100 rotate-0 opacity-100"
                        : "scale-0 rotate-90 opacity-0"
                    }`}
            />

            <span className="sr-only">Cambiar tema</span>
        </Button>
    )
}
