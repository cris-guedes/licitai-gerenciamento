"use client"

import { useEffect, useState } from "react"
import type { Section } from "./useHeadings"

export function useScrollSpy(
    sections: Section[],
    rootRef?: React.RefObject<HTMLElement | null>
): [string, (id: string) => void] {
    const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "")

    useEffect(() => {
        if (!sections.length) return

        const observers: IntersectionObserver[] = []
        const visible = new Set<string>()

        sections.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (!el) return

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        visible.add(id)
                    } else {
                        visible.delete(id)
                    }

                    const first = sections.find((s) => visible.has(s.id))
                    if (first) setActiveId(first.id)
                },
                {
                    root: rootRef?.current,
                    // Gatilho quando o título entra nos 20% superiores do container
                    rootMargin: "0px 0px -80% 0px",
                    threshold: 0,
                },
            )

            observer.observe(el)
            observers.push(observer)
        })

        return () => observers.forEach((o) => o.disconnect())
    }, [sections, rootRef])

    return [activeId, setActiveId]
}
