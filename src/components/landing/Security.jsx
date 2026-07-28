import { motion } from 'framer-motion';
import { ShieldCheck, Lock, EyeOff, ServerCog } from 'lucide-react';
import Reveal from './Reveal';

const points = [
  { icon: Lock, title: 'Chiffrement de bout en bout', description: 'Vos données sont chiffrées en AES-256, en transit et au repos. Le même standard que les banques.' },
  { icon: EyeOff, title: 'Vie privée respectée', description: 'Nous ne revendons jamais vos données financières. Votre argent, vos données, vos décisions.' },
  { icon: ServerCog, title: 'Infrastructure européenne', description: 'Serveurs hébergés en UE, soumis au RGPD. Vos informations ne quittent pas l\'Europe.' },
  { icon: ShieldCheck, title: 'Accès sécurisé', description: 'Authentification renforcée, sessions chiffrées et surveillance continue contre toute intrusion.' },
];

export default function Security() {
  return (
    <section id="securite" className="py-24 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Confiance & sécurité</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">Votre confiance, notre priorité</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Gérer son argent personnel exige une confidentialité absolue. Nous avons bâti FlowDesk
            avec les mêmes exigences de sécurité que les établissements bancaires.
          </p>
          <div className="space-y-5">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/30 blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl animate-pulse-slow" />
            </div>
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-32 h-32 rounded-full bg-card border border-border shadow-2xl flex items-center justify-center"
            >
              <ShieldCheck className="w-16 h-16 text-primary" />
            </motion.div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}