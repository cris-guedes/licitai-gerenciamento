import React from 'react';
import { Card, CardContent } from '@/client/components/ui/card';

export function Features() {
  const features = [
    {
      title: 'Descoberta Inteligente',
      description: 'Filtros avançados e IA para encontrar as licitações que realmente fazem sentido para seu negócio.',
      icon: '🔍',
    },
    {
      title: 'Gestão de Documentos',
      description: 'Centralize editais, certidões e propostas em um repositório seguro e organizado.',
      icon: '📂',
    },
    {
      title: 'Prazos e Alertas',
      description: 'Nunca mais perca uma data de entrega ou sessão com nosso sistema de lembretes automáticos.',
      icon: '⏰',
    },
    {
      title: 'Análise de Concorrência',
      description: 'Tenha insights sobre seus concorrentes e aumente suas chances de vitória.',
      icon: '📈',
    },
    {
      title: 'Colaboração em Equipe',
      description: 'Fluxo de trabalho compartilhado entre os times administrativo, jurídico e comercial.',
      icon: '👥',
    },
    {
      title: 'Pós-Venda e Contratos',
      description: 'Acompanhe a execução dos contratos e garanta o compliance após a homologação.',
      icon: '📝',
    },
  ];

  return (
    <section className="py-24 bg-neutral-soft">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-brand-obsidian mb-4 md:text-4xl">
            Tudo o que sua equipe precisa para vencer
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma completa que cobre desde a busca inicial até a gestão do contrato assinado.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
              <CardContent className="p-8">
                <div className="size-12 bg-muted rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-brand-yellow group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-brand-obsidian mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
