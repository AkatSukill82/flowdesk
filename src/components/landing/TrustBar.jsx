import { motion } from 'framer-motion';
import { ShieldCheck, Lock, EyeOff, FileCheck } from 'lucide-react';

const items = [
  { icon: ShieldCheck, label: 'Sécurité niveau bancaire' },
  { icon: Lock, label: 'Chiffrement AES-256' },
  { icon: EyeOff, label: 'Vos données ne sont jamais revendues' },
  { icon: FileCheck, label: 'Conforme RGPD' },
];

export default function TrustBar() {
  return (
    <section className="py-6 px-4 border-y border-border bg-card/50">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <item.icon className="w-4 h-4 text-primary" />
            <span className="font-medium">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}