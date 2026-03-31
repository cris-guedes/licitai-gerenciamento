import React from 'react';
import { Card, CardContent } from '@/client/components/ui/card';

export function UseCases() {
  const cases = [
    {
      title: 'Empresas Licitantes',
      description: 'Ideal para empresas que buscam ganhar escala nas vendas para o governo sem aumentar a equipe.',
      features: ['Triagem inteligente', 'Checklist de documentos', 'Gestão de prazos']
    },
    {
      title: 'Consultorias Especializadas',
      description: 'Ferramenta completa para gerenciar múltiplos clientes e dezenas de processos simultâneos.',
      features: ['Multi-empresa', 'Relatórios personalizados', 'Portal do cliente']
    },
    {
      title: 'Departamentos Jurídicos',
      description: 'Controle total de compliance, recursos e documentos legais de forma organizada.',
      features: ['Histórico de recursos', 'Vigência de certidões', 'Gestão de contratos']
    }
  ];

  return (
    <section className="py-24 bg-neutral-soft">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-brand-obsidian mb-4 md:text-4xl">
            Soluções para cada perfil de equipe
          </h2>
          <p className="text-lg text-muted-foreground">
            O Licitare se adapta ao seu fluxo de trabalho, independente do tamanho da sua operação.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((c) => (
            <div key={c.title} className="flex flex-col bg-white rounded-3xl p-8 border border-brand-obsidian/5 hover:border-brand-yellow transition-colors shadow-sm">
              <h3 className="text-2xl font-bold text-brand-obsidian mb-4">{c.title}</h3>
              <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">
                {c.description}
              </p>
              <ul className="space-y-3">
                {c.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-semibold text-brand-obsidian">
                    <div className="size-2 bg-brand-yellow rounded-full"></div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
