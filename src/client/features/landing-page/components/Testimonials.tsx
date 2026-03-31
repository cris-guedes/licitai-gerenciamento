import React from 'react';
import { Card, CardContent } from '@/client/components/ui/card';

export function Testimonials() {
  const testimonials = [
    {
      quote: "O Licitare mudou nossa forma de trabalhar. Antes perdíamos metade das oportunidades por falta de tempo para triagem. Hoje focamos no que importa.",
      author: "Ricardo Mendes",
      role: "Diretor Comercial @ GovTech",
      avatar: "RM"
    },
    {
      quote: "A gestão de documentos é o ponto alto. Ter todas as certidões centralizadas e com lembretes salvou nossa empresa de várias inabilitações.",
      author: "Juliana Costa",
      role: "Coordenadora Jurídica @ Licitare Consulting",
      avatar: "JC"
    },
    {
      quote: "Interface premium e intuitiva. É raro ver um software de licitação que realmente se preocupa com a experiência do usuário.",
      author: "Marcos Silva",
      role: "Analista de Licitações @ TechFlow",
      avatar: "MS"
    }
  ];

  return (
    <section className="py-24 bg-brand-obsidian text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 size-96 bg-brand-yellow/10 rounded-full blur-[120px]"></div>
      
      <div className="container px-4 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold md:text-4xl mb-4">Aprovado por quem entende do negócio</h2>
          <p className="text-brand-yellow/80 font-medium">Histórias de sucesso de quem utiliza o Licitare diariamente</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-8">
                <div className="text-brand-yellow text-4xl mb-6 font-serif">"</div>
                <p className="text-lg leading-relaxed text-gray-200 mb-8 italic">
                  {t.quote}
                </p>
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-brand-yellow text-brand-obsidian flex items-center justify-center rounded-full font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-white leading-none mb-1">{t.author}</h4>
                    <p className="text-sm text-brand-yellow/60">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
