import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-obsidian flex-col justify-between p-12 overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-20 -left-20 size-[480px] rounded-full border border-brand-yellow/10" />
          <div className="absolute top-1/3 -right-32 size-[560px] rounded-full border border-brand-yellow/10" />
          <div className="absolute -bottom-24 left-1/4 size-[360px] rounded-full border border-brand-yellow/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full border border-brand-yellow/5" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="size-9 bg-brand-yellow rounded-xl flex items-center justify-center">
            <div className="size-4 bg-brand-obsidian rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase italic">
            Licitai
          </span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white tracking-tight leading-[1.05]">
              Extraia<br />
              <span className="text-brand-yellow">Editais</span>
            </h1>
            <p className="text-base text-white/60 font-medium leading-relaxed max-w-sm">
              Inteligência de extração de informações de editais para você gerenciar e vencer mais licitações.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Extração automática de dados de editais",
              "Gestão de documentos e prazos",
              "Relatórios e análises estratégicas",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-brand-yellow flex-shrink-0" />
                <span className="text-white/70 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">
            © 2026 Licitai Gerenciamento. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  )
}
