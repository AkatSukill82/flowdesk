import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

export default function FinalCTA() {
  return (
    <section className="py-24 px-4">
      <Reveal>
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 px-8 py-16 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/30 blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/40 blur-3xl animate-pulse-slow" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative text-3xl sm:text-4xl font-bold text-primary-foreground mb-4"
          >
            Prêt à reprendre le contrôle ?
          </motion.h2>
          <p className="relative text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Rejoignez des milliers de particuliers qui dorment mieux depuis qu'ils maîtrisent leur budget.
          </p>
          <Link to="/register" className="relative inline-block">
            <Button size="lg" variant="secondary" className="gap-2 px-8 text-base h-12 shadow-xl">
              Démarrer gratuitement <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}