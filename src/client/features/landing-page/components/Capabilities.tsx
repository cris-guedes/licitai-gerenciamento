import React from 'react';

export function Capabilities() {
  const steps = [
    {
      number: '01',
      title: 'Triagem Automática',
      description: 'Nossa IA analisa milhares de editais diariamente e separa apenas o que é relevante para seu CNAE.',
      detail: 'Economize 10+ horas semanais de leitura técnica.'
    },
    {
      number: '02',
      title: 'Workflow de Habilitação',
      description: 'Checklist inteligente de documentos necessários para cada modalidade (Pregão, Dispensa, etc).',
      detail: 'Reduza em 90% o risco de inabilitação por falta de documento.'
    },
    {
      number: '03',
      title: 'Gestão Constratual',
      description: 'Acompanhe a vigência, aditivos e medições de forma automatizada.',
      detail: 'Tenha controle total do faturamento pós-licitação.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-brand-obsidian md:text-4xl mb-6">
                Como o Licitai Gerenciamento potencializa seus resultados
              </h2>
              <p className="text-lg text-muted-foreground">
                Diga adeus às planilhas manuais e ao caos das certidões vencidas.
              </p>
            </div>
            
            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6 group">
                  <div className="text-4xl font-black text-brand-yellow/30 group-hover:text-brand-yellow transition-colors">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-obsidian mb-2">{step.title}</h3>
                    <p className="text-muted-foreground mb-2">{step.description}</p>
                    <p className="text-sm font-semibold text-brand-obsidian italic">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="bg-brand-obsidian p-4 rounded-3xl shadow-2xl relative">
              <div className="bg-neutral-soft rounded-2xl overflow-hidden border border-white/10 aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center">
                 {/* Workflow Visualization Placeholder */}
                 <div className="p-8 w-full h-full flex flex-col gap-6">
                    <div className="h-10 w-1/3 bg-brand-obsidian rounded-lg flex items-center px-4">
                      <div className="size-3 bg-brand-yellow rounded-full mr-2"></div>
                      <div className="h-2 w-full bg-white/20 rounded-full"></div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl shadow-sm border border-brand-obsidian/5 p-4 flex flex-col gap-3">
                        <div className="h-4 w-1/2 bg-brand-obsidian/10 rounded-full"></div>
                        <div className="flex-1 bg-brand-obsidian/5 rounded-lg flex flex-col p-2 gap-2">
                           <div className="h-2 w-full bg-brand-yellow/50 rounded-full"></div>
                           <div className="h-2 w-3/4 bg-brand-obsidian/10 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl shadow-sm border border-brand-obsidian/5 p-4 flex flex-col gap-3">
                        <div className="h-4 w-1/2 bg-brand-obsidian/10 rounded-full"></div>
                        <div className="flex-1 bg-brand-obsidian/5 rounded-lg flex flex-col p-2 gap-2">
                           <div className="h-2 w-full bg-brand-yellow/50 rounded-full"></div>
                           <div className="h-2 w-3/4 bg-brand-obsidian/10 rounded-full"></div>
                        </div>
                      </div>
                      <div className="col-span-2 bg-brand-obsidian text-white rounded-xl p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">Dashboard de Performance</span>
                          <span className="text-brand-yellow text-xs font-bold px-2 py-1 bg-white/10 rounded-full">Live</span>
                        </div>
                        <div className="h-32 w-full flex items-end gap-2">
                          <div className="flex-1 h-1/2 bg-brand-yellow rounded-t-sm"></div>
                          <div className="flex-1 h-3/4 bg-brand-yellow rounded-t-sm"></div>
                          <div className="flex-1 h-full bg-brand-yellow rounded-t-sm"></div>
                          <div className="flex-1 h-2/3 bg-brand-yellow rounded-t-sm"></div>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
