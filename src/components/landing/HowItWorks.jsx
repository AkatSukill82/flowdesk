import { motion } from 'framer-motion';
import { UserPlus, LayoutDashboard, TrendingUp } from 'lucide-react';
import Reveal from './Reveal';

const steps = [
  { icon: UserPlus, title: 'Créez votre compte', description: 'Inscrivez-vous en 30 secondes, sans carte bancaire. Ajoutez vos comptes manuellement ou par import.' },
  { icon: LayoutDashboard, title: 'Centralisez vos données', description: 'Reliez vos sources : banques, abonnements, relevés par email. Tout s\'organise automatiquement.' },
  { icon: TrendingUp, title: 'Pilotez votre budget', description: 'Suivez vos prévisions, recevez des alertes, et prenez les bonnes décisions au bon moment.' },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-card/40 border-y border-border">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <p className="text-center text-primary font-semibold text-sm uppercase tracking-wider mb-3">Comment ça marche</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">Trois étapes vers la sérénité</h2>
        </Reveal>
        <div className="relative">
          <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-border" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.15}>
                <div className="relative text-center">
                  <div className="relative inline-flex w-24 h-24 mx-auto mb-5">
                    <div className="absolute inset-0 rounded-full bg-primary/10" />
                    <motion.div
                      initial={{ scale: 0.8 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.2, type: 'spring' }}
                      className="relative w-24 h-24 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-md"
                    >
                      <s.icon className="w-9 h-9 text-primary" />
                    </motion.div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}