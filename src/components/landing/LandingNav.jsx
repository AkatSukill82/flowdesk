import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function LandingNav() {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 80], [0, 12]);
  const bg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)']);

  return (
    <motion.nav
      style={{ backdropFilter: blur.get() ? `blur(${blur.get()}px)` : undefined, backgroundColor: bg }}
      className="fixed top-0 inset-x-0 z-50 border-b border-border/40"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/landing" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-xl tracking-tight">FlowDesk</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <a href="#fonctionnalites" className="hover:text-foreground transition-colors">Fonctionnalités</a>
          <a href="#securite" className="hover:text-foreground transition-colors">Sécurité</a>
          <a href="#tarifs" className="hover:text-foreground transition-colors">Tarifs</a>
          <a href="#temoignages" className="hover:text-foreground transition-colors">Avis</a>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/login"><Button variant="ghost" size="sm">Connexion</Button></Link>
          <Link to="/register"><Button size="sm" className="gap-1.5">Commencer</Button></Link>
        </div>
      </div>
    </motion.nav>
  );
}