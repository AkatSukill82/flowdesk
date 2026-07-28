import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const stats = [
  { to: 24000, suffix: '+', label: 'utilisateurs sereins' },
  { to: 99, suffix: '%', label: 'données chiffrées' },
  { to: 4, suffix: '★', label: 'satisfaction moyenne' },
];

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 80]);
  const y2 = useTransform(scrollY, [0, 600], [0, -60]);

  return (
    <section className="relative pt-36 pb-24 px-4 overflow-hidden">
      {/* Ambient gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/15 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Conçu pour les particuliers · Sans jargon bancaire
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Reprenez le contrôle
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">de votre argent.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            FlowDesk rassemble tous vos comptes, abonnements et dépenses dans un tableau de bord clair.
            Voyez où passe votre argent, anticipez les coups durs, et dormez sur vos deux oreilles.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="gap-2 px-8 text-base h-12 shadow-lg shadow-primary/20">
                Démarrer gratuitement <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" /> Aucune carte requise · Essai libre
            </div>
          </div>
        </motion.div>

        {/* Floating dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16"
        >
          <motion.div style={{ y: y1 }} className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Solde total', value: '€ 24 850', accent: true },
                  { label: 'Entrées du mois', value: '€ 8 420', accent: true },
                  { label: 'Sorties du mois', value: '€ 3 180' },
                  { label: 'Prévision 30 j', value: '€ 30 090', accent: true },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="bg-card rounded-xl p-4 border border-border"
                  >
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className={`text-lg sm:text-xl font-bold mt-1 ${item.accent ? 'text-primary' : 'text-foreground'}`}>{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Floating trust chips */}
          <motion.div style={{ y: y2 }} className="absolute -top-6 right-[8%] hidden md:flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-xl">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Chiffrement bancaire</span>
          </motion.div>
        </motion.div>

        {/* Animated stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.15 }}
              className="text-center"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-primary">
                <AnimatedCounter to={s.to} suffix={s.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}