"use client"

import { useCallback, useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Menu, X, FileText, BarChart3, Layers, Hash, Activity, Search } from "lucide-react"
import { useHeadings } from "./hooks/useHeadings"
import { useScrollSpy } from "./hooks/useScrollSpy"
import { Sidebar } from "./Sidebar"

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Extrai texto puro de elementos React (útil para títulos com negrito/itálico) */
function flattenChildren(children: any): string {
    if (typeof children === "string") return children
    if (Array.isArray(children)) return children.map(flattenChildren).join("")
    if (children?.props?.children) return flattenChildren(children.props.children)
    return ""
}

function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

/** ~250 words per page (Brazilian legal docs tend to be dense) */
function estimatePages(wordCount: number): number {
    return Math.max(1, Math.round(wordCount / 250))
}

// ─── types ────────────────────────────────────────────────────────────────────

interface MarkdownViewerProps {
    content:   string
    wordCount?: number
    fileSizeKb?: number
    className?: string
}

// ─── component ───────────────────────────────────────────────────────────────

export function MarkdownViewer({
    content,
    wordCount,
    fileSizeKb,
    className = "",
}: MarkdownViewerProps) {
    const sections                = useHeadings(content)
    const scrollContainerRef      = useRef<HTMLElement | null>(null)
    const [activeId, setActiveId] = useScrollSpy(sections, scrollContainerRef)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Resetamos o contador de slugs a cada renderização para bater com o sidebar
    const renderSlugCount: Record<string, number> = {}

    const wc    = wordCount  ?? content.split(/\s+/).filter(Boolean).length
    const pages = estimatePages(wc)

    const handleNavigate = useCallback((id: string) => {
        const el = document.getElementById(id)
        const container = scrollContainerRef.current
        
        if (el && container) {
            setActiveId(id)
            const offsetTop = el.offsetTop - 32
            container.scrollTo({
                top: offsetTop,
                behavior: "smooth"
            })
        }
        setSidebarOpen(false)
    }, [setActiveId])

    const generateId = (children: any) => {
        const text = flattenChildren(children)
        const base = slugify(text)
        renderSlugCount[base] = (renderSlugCount[base] ?? 0) + 1
        return renderSlugCount[base] === 1 ? base : `${base}-${renderSlugCount[base] - 1}`
    }

    return (
        <div className={`flex flex-col bg-background h-[850px] overflow-hidden ${className}`}>
            {/* ── Header Unificado (Título + Stats) ─────────────────────── */}
            <header className="shrink-0 px-8 py-6 border-b border-border/40 bg-card/20 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[9px]">
                            <Search className="size-3" />
                            Visualizador de Edital
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight">Análise Estrutural</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                        <StatItem icon={<FileText className="size-3.5" />} label="Páginas" value={`~${pages}`} />
                        <StatItem icon={<Activity className="size-3.5" />} label="Palavras" value={wc.toLocaleString("pt-BR")} />
                        {fileSizeKb && (
                            <StatItem icon={<Hash className="size-3.5" />} label="Arquivo" value={`${fileSizeKb.toFixed(1)} KB`} />
                        )}
                        <StatItem icon={<Layers className="size-3.5" />} label="Seções" value={String(sections.length)} />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Mobile overlay ────────────────────────────────────────────── */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ── Sidebar (Glossário Minimalista) ─────────────────────────── */}
                <aside
                    className={[
                        "fixed top-0 left-0 z-30 h-full w-[280px] bg-muted/10 overflow-y-auto pt-16 pb-8 px-4 transition-transform duration-200 lg:relative lg:translate-x-0 lg:shrink-0 lg:z-auto lg:pt-6 lg:border-r lg:border-border/40",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    ].join(" ")}
                >
                    <div className="mb-4 px-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">Estrutura do Documento</p>
                    </div>
                    <Sidebar
                        sections={sections}
                        activeId={activeId}
                        onNavigate={handleNavigate}
                    />
                </aside>

                {/* ── Conteúdo (Independente e Clean) ─────────────────────────── */}
                <main 
                    ref={scrollContainerRef}
                    className="min-w-0 flex-1 px-8 lg:px-16 py-10 overflow-y-auto relative scroll-smooth bg-background selection:bg-primary/10"
                >
                    <article className="prose prose-slate dark:prose-invert max-w-none
                        prose-headings:scroll-mt-8 prose-headings:font-semibold prose-headings:tracking-tight
                        prose-h1:text-4xl prose-h1:border-b prose-h1:pb-6 prose-h1:mb-10 prose-h1:text-foreground
                        prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-foreground/90
                        prose-h3:text-lg prose-h3:mt-10 prose-h3:mb-4
                        prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-foreground/70
                        prose-strong:text-foreground prose-strong:font-bold
                        prose-table:my-10 prose-table:rounded-xl prose-table:border prose-table:border-border/30
                        prose-th:bg-muted/50 prose-th:px-5 prose-th:py-4 prose-th:text-[11px] prose-th:font-bold prose-th:uppercase prose-th:tracking-widest
                        prose-td:px-5 prose-td:py-4 prose-td:border-b prose-td:border-border/20
                        prose-li:my-2
                    ">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children, ...props }) => <h1 id={generateId(children)} {...props}>{children}</h1>,
                                h2: ({ children, ...props }) => <h2 id={generateId(children)} {...props}>{children}</h2>,
                                h3: ({ children, ...props }) => <h3 id={generateId(children)} {...props}>{children}</h3>,
                                table: ({ children }) => (
                                    <div className="not-prose my-10 overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left border-collapse">{children}</table>
                                        </div>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-muted/30 border-b border-border/40 text-foreground font-semibold italic">{children}</thead>
                                ),
                                tr: ({ children }) => (
                                    <tr className="group border-b border-border/10 last:border-0 hover:bg-muted/10 transition-colors uppercase-cell-fix">{children}</tr>
                                ),
                                th: ({ children }) => (
                                    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">{children}</th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-5 py-4 align-top leading-relaxed text-foreground/80">{children}</td>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-bold text-primary bg-primary/5 px-0.5 rounded-sm">{children}</strong>
                                ),
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </article>
                    <div className="h-40" />
                </main>
            </div>

            {/* ── Mobile toggle button ─────────────────────────────────────── */}
            <button
                onClick={() => setSidebarOpen((o) => !o)}
                className="fixed bottom-8 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl lg:hidden active:scale-95 transition-transform"
                aria-label="Abrir índice"
            >
                {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
        </div>
    )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-primary/70">{icon}</div>
            <div className="flex flex-col -space-y-0.5">
                <span className="text-[9px] uppercase font-bold tracking-widest opacity-40">{label}</span>
                <span className="text-sm font-semibold text-foreground/80 tracking-tight">{value}</span>
            </div>
        </div>
    )
}
