import Link from 'next/link';
import { Button } from '@/client/components/ui/button';

export function Hero() {
  return (
    <section className="relative pt-20 pb-16 overflow-hidden md:pt-32 md:pb-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:text-left lg:gap-16">
          <div className="flex-1 max-w-2xl">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-brand-obsidian md:text-6xl lg:leading-[1.1]">
              Domine as Licitações Públicas com <span className="text-brand-obsidian underline decoration-brand-yellow decoration-4 underline-offset-4">Inteligência</span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-foreground md:text-xl font-medium">
              A plataforma definitiva para descobrir, organizar e vencer processos licitatórios. Gerencie documentos, prazos e contratos em um só lugar com design premium e fluxo simplificado.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                asChild
                className="bg-brand-yellow text-brand-obsidian hover:bg-brand-yellow/90 text-md font-bold h-12 px-8 rounded-md transition-all transform hover:scale-105"
                size="lg"
              >
                <Link href="/signup">Começar agora gratuitamente</Link>
              </Button>
              <Button 
                variant="outline" 
                className="border-brand-obsidian text-brand-obsidian hover:bg-brand-obsidian hover:text-white h-12 px-8 font-semibold"
                size="lg"
              >
                Agendar demonstração
              </Button>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-2xl">
            <div className="relative p-2 bg-brand-obsidian rounded-2xl shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow/20 to-transparent opacity-50"></div>
              <div className="relative bg-white rounded-lg border border-brand-obsidian/10 aspect-[16/10] flex items-center justify-center p-8">
                 {/* UI Preview Placeholder */}
                 <div className="w-full h-full flex flex-col gap-4">
                    <div className="w-full h-8 bg-brand-obsidian/5 rounded-md flex items-center px-4 gap-2">
                      <div className="size-2 rounded-full bg-red-400"></div>
                      <div className="size-2 rounded-full bg-yellow-400"></div>
                      <div className="size-2 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex flex-1 gap-4">
                      <div className="w-1/4 h-full bg-brand-obsidian/5 rounded-md p-4 flex flex-col gap-2">
                        <div className="w-full h-3 bg-brand-obsidian/20 rounded-full"></div>
                        <div className="w-full h-3 bg-brand-obsidian/10 rounded-full"></div>
                        <div className="w-full h-3 bg-brand-obsidian/10 rounded-full"></div>
                        <div className="w-full h-3 bg-brand-obsidian/10 rounded-full"></div>
                      </div>
                      <div className="flex-1 h-full bg-brand-obsidian/5 rounded-md p-4">
                        <div className="w-1/2 h-5 bg-brand-obsidian/20 rounded-full mb-4"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="aspect-video bg-white rounded-lg border border-brand-obsidian/10 p-3 flex flex-col justify-between">
                            <div className="w-1/2 h-2 bg-brand-yellow rounded-full"></div>
                            <div className="w-full h-4 bg-brand-obsidian/5 rounded-full"></div>
                          </div>
                          <div className="aspect-video bg-white rounded-lg border border-brand-obsidian/10 p-3 flex flex-col justify-between">
                            <div className="w-1/2 h-2 bg-brand-yellow rounded-full"></div>
                            <div className="w-full h-4 bg-brand-obsidian/5 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 size-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 size-96 bg-brand-obsidian/5 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  );
}
