"use client"

import { Hash } from "lucide-react"
import type { Section } from "./hooks/useHeadings"

interface SidebarProps {
    sections: Section[]
    activeId: string
    onNavigate: (id: string) => void
}

export function Sidebar({ sections, activeId, onNavigate }: SidebarProps) {
    if (!sections.length) return null

    return (
        <nav className="flex flex-col text-sm relative" aria-label="Seções do documento">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold mb-4 px-2">
                Conteúdo do Edital
            </p>
            <div className="flex flex-col gap-0.5">
                {sections.map((section) => {
                    const isActive = section.id === activeId
                    
                    // Diferenciação clara de níveis (H1, H2, H3)
                    const levelStyles = 
                        section.level === 1 
                            ? "font-bold text-[13px] text-foreground mt-4 mb-1 first:mt-0" 
                            : section.level === 2 
                                ? "pl-5 text-[12px] text-muted-foreground/90 font-medium" 
                                : "pl-10 text-[11px] text-muted-foreground/70 font-normal"

                    return (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            onClick={(e) => {
                                // Deixa o navegador tratar o scroll via href, 
                                // mas chamamos onNavigate para fechar a sidebar no mobile e marcar como ativo
                                onNavigate(section.id)
                            }}
                            className={[
                                "group relative flex items-center py-1.5 px-3 rounded-md transition-all duration-200 text-left cursor-pointer",
                                levelStyles,
                                isActive
                                    ? "bg-primary/10 text-primary translate-x-1"
                                    : "hover:bg-muted/50 hover:text-foreground",
                            ].join(" ")}
                        >
                            {/* Indicador de Seleção Ativa */}
                            {isActive && (
                                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                            )}
                            
                            <span className="truncate flex-1 leading-tight">
                                {section.title}
                            </span>

                            {isActive && section.level === 1 && (
                                <Hash className="size-3 shrink-0 ml-2 opacity-60" />
                            )}
                        </a>
                    )
                })}
            </div>
        </nav>
    )
}
