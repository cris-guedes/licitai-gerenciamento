import React from 'react';

export function SocialProof() {
  const logos = [
    { name: 'GovGroup', label: 'GOV' },
    { name: 'TechBids', label: 'T' },
    { name: 'LicitarePlus', label: 'L+' },
    { name: 'AdminSistemas', label: 'A' },
    { name: 'ConsultGov', label: 'CG' },
  ];

  return (
    <section className="py-12 border-y border-brand-obsidian/5 bg-white/50">
      <div className="container px-4 mx-auto max-w-7xl">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
          Utilizado pelas maiores empresas e consultorias do Brasil
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2 group">
              <div className="size-10 bg-brand-obsidian rounded-lg flex items-center justify-center text-brand-yellow font-black text-xl group-hover:scale-110 transition-transform">
                {logo.label}
              </div>
              <span className="text-xl font-bold text-brand-obsidian tracking-tight">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
