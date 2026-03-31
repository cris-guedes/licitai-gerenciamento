import Link from 'next/link';
import { Button } from '@/client/components/ui/button';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-obsidian/5">
      <div className="container px-4 mx-auto max-w-7xl flex items-center justify-between h-20">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-brand-obsidian rounded-lg flex items-center justify-center">
             <div className="size-4 bg-brand-yellow rounded-sm rotate-45"></div>
          </div>
          <span className="text-2xl font-black text-brand-obsidian tracking-tighter uppercase italic">Licitare</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-brand-obsidian uppercase tracking-wide">
          <a href="#features" className="hover:text-brand-yellow transition-colors">Funcionalidades</a>
          <a href="#use-cases" className="hover:text-brand-yellow transition-colors">Casos de Uso</a>
          <a href="#testimonials" className="hover:text-brand-yellow transition-colors">Depoimentos</a>
          <a href="#pricing" className="hover:text-brand-yellow transition-colors">Preços</a>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-brand-obsidian uppercase tracking-wide hover:text-brand-yellow transition-colors">Login</Link>
          <Button asChild className="bg-brand-obsidian text-brand-yellow hover:bg-brand-obsidian/90 font-bold px-6 h-10 uppercase text-xs tracking-widest rounded-lg">
            <Link href="/signup">Começar Grátis</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
