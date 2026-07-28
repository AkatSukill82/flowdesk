import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Reveal from './Reveal';

const plans = [
  { name: 'Découverte', price: '0', description: 'Pour bien démarrer', features: ['1 compte', 'Saisie manuelle', '3 mois d\'historique', 'Tableau de bord complet'], cta: 'Commencer gratuitement', popular: false },
  { name: 'Pro', price: '12', description: 'Pour piloter sereinement', features: ['Comptes illimités', 'Import CSV & Sheets', 'Alertes intelligentes', 'Prévisions 30 jours', 'Résumé hebdomadaire', 'Score de santé financière'], cta: 'Essayer Pro', popular: true },
  { name: 'Famille', price: '29', description: 'Pour le foyer', features: ['Tout dans Pro', 'Relevés automatiques par email', 'Suivi des abonnements', 'Jusqu\'à 3 membres', 'Support prioritaire'], cta: 'Essayer Famille', popular: false },
];

export default function Pricing() {
  return (
    <section id="tarifs" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-center text-primary font-semibold text-sm uppercase tracking-wider mb-3">Tarifs</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Simple et transparent</h2>
          <p className="text-muted-foreground text-center mb-14">Commencez gratuitement, évoluez quand vous êtes prêt.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <Card className={`h-full relative ${plan.popular ? 'border-primary shadow-xl shadow-primary/10 md:-translate-y-3' : 'border-border'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3">Le plus choisi</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    {plan.price !== '0' && <span className="text-muted-foreground text-sm">/mois</span>}
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button className={`w-full ${plan.popular ? '' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}