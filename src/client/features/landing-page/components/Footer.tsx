import React from 'react';

export function Footer() {
  return (
    <footer className="py-20 bg-brand-obsidian text-white">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                 <div className="size-4 bg-brand-obsidian rounded-sm rotate-45"></div>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Licitai</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-xs">
              Inteligência de extração de editais e gestão completa de licitações públicas.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase text-sm tracking-widest text-brand-yellow">Produto</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Versão PRO</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase text-sm tracking-widest text-brand-yellow">Suporte</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Materiais</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase text-sm tracking-widest text-brand-yellow">Legal</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Cookies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © 2026 Licitai Gerenciamento. Todos os direitos reservados.
          </p>
          <div className="flex gap-8">
             <div className="size-5 bg-white/10 rounded-full"></div>
             <div className="size-5 bg-white/10 rounded-full"></div>
             <div className="size-5 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
