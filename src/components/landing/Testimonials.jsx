import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Reveal from './Reveal';

const testimonials = [
  { name: 'Camille D.', role: 'Indépendante', text: 'J\'ai enfin une vue d\'ensemble. J\'ai économisé 480 € en annulant des abonnements oubliés.', initial: 'C' },
  { name: 'Marc L.', role: 'Particulier', text: 'Les alertes m\'ont évité un découvert deux mois de suite. Le calme retrouvé.', initial: 'M' },
  { name: 'Sofia R.', role: 'Mère de famille', text: 'Les prévisions 30 jours changent tout. Je sais exactement où je peux me lâcher ce mois-ci.', initial: 'S' },
];

export default function Testimonials() {
  return (
    <section id="temoignages" className="py-24 px-4 bg-card/40 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-center text-primary font-semibold text-sm uppercase tracking-wider mb-3">Ils nous font confiance</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">Des particuliers, plus sereins</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <Card className="h-full border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, k) => (
                      <Star key={k} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-5">« {t.text} »</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">{t.initial}</div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}