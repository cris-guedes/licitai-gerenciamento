import Link from 'next/link';
import { Button } from '@/client/components/ui/button';

export function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="bg-brand-obsidian rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-96 bg-brand-yellow/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 size-96 bg-brand-yellow/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6 md:text-5xl lg:text-6xl">
              Pronto para escalar suas vendas para o governo?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Junte-se a centenas de empresas que já estão vencendo mais licitações com o Licitare.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                asChild
                className="bg-brand-yellow text-brand-obsidian hover:bg-brand-yellow/90 h-16 px-10 text-xl font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
              >
                <Link href="/signup">Começar agora gratuitamente</Link>
              </Button>
            </div>
            <p className="mt-8 text-gray-400 text-sm font-medium uppercase tracking-widest">
              SEM CARTÃO DE CRÉDITO • TESTE POR 14 DIAS
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
