"use client"

import { useMemo } from "react"

export type Section = {
    id:    string
    title: string
    level: number
}

function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")   // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export function useHeadings(markdown: string): Section[] {
    return useMemo(() => {
        const lines    = markdown.split("\n")
        const sections: Section[] = []
        const slugCount: Record<string, number> = {}

        for (const line of lines) {
            const match = line.match(/^(#{1,3})\s+(.+)/)
            if (!match) continue

            const level = match[1].length
            const title = match[2].trim()
            const baseId = slugify(title)
            
            // Deduplicate slugs
            slugCount[baseId] = (slugCount[baseId] ?? 0) + 1
            const id = slugCount[baseId] === 1 ? baseId : `${baseId}-${slugCount[baseId] - 1}`

            sections.push({ id, title, level })
        }

        return sections
    }, [markdown])
}
