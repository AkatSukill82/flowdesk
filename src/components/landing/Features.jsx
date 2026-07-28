import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Bell, TrendingUp, Mail, Wallet, Zap } from 'lucide-react';
import Reveal from './Reveal';

const features = [
  { icon: BarChart3, title: 'Tout centralisé', description: 'Comptes, transactions et abonnements réunis dans un seul tableau de bord clair et intuitif.' },
  { icon: Bell, title: 'Alertes proactives', description: 'Soyez prévenu en langage clair : solde bas, pic de dépenses, renouvellement à venir.' },
  { icon: TrendingUp, title: 'Prévisions fiables', description: 'Visualisez votre solde dans 30 jours. Pas de jargon, juste des chiffres clairs pour décider.' },
  { icon: Mail, title: 'Relevés automatiques', description: 'Vos emails de paiement scannés et triés automatiquement. Plus de saisie manuelle.' },
  { icon: Wallet, title: 'Suivi des abonnements', description: 'Repérez les abonnements oubliés et annulez en un clic ceux qui ne vous servent plus.' },
  { icon: Zap, title: 'Saisie simplifiée', description: 'Importez vos transactions par CSV ou Google Sheets en quelques secondes.' },
];

export default function Features() {
  return (
    <section id="fonctionnalites" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-center text-primary font-semibold text-sm uppercase tracking-wider mb-3">Pourquoi FlowDesk</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Un assistant financier, pas un tableur</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            Pensé pour les particuliers qui veulent comprendre leur argent sans devenir comptable.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <Card className="h-full border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <f.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}