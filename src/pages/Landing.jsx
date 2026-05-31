import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Bell,
  TrendingUp,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BarChart3,
    title: 'Tout centralisé',
    description: 'Tous tes comptes, transactions et abonnements dans un seul tableau de bord clair et intuitif.',
  },
  {
    icon: Bell,
    title: 'Alertes proactives',
    description: 'Des notifications en langage clair quand un risque approche : solde bas, pic de dépenses, renouvellements.',
  },
  {
    icon: TrendingUp,
    title: 'Prévisions simples',
    description: 'Sache exactement où tu seras dans 30 jours. Pas de jargon comptable, juste des chiffres clairs.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Pour démarrer',
    features: ['1 compte', 'Saisie manuelle', '3 mois d\'historique', 'Tableau de bord'],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Pro',
    price: '12',
    description: 'Pour les freelances',
    features: [
      'Comptes illimités',
      'Import CSV',
      'Alertes intelligentes',
      'Prévisions 30 jours',
      'Résumé hebdomadaire',
      'Score de santé financière',
    ],
    cta: 'Essayer Pro',
    popular: true,
  },
  {
    name: 'Business',
    price: '29',
    description: 'Pour les équipes',
    features: [
      'Tout dans Pro',
      'Intégration Stripe',
      'Webhook entrant',
      'Accès API',
      'Jusqu\'à 3 membres',
      'Support prioritaire',
    ],
    cta: 'Essayer Business',
    popular: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-xl tracking-tight">FlowDesk</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Commencer</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              <Zap className="w-3 h-3 mr-1" /> Simple · Proactif · Sans jargon
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Tes finances,
              <br />
              <span className="text-primary">enfin claires.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Le seul tableau de bord financier que tout entrepreneur comprend au premier coup d'œil.
              Pas de comptabilité compliquée. Juste une vue claire de ton argent.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 px-8 text-base">
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground self-center">Pas de carte bancaire requise</p>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden"
          >
            <div className="p-4 sm:p-8 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Solde total', value: '€ 24,850', color: 'text-primary' },
                  { label: 'Entrées du mois', value: '€ 8,420', color: 'text-primary' },
                  { label: 'Sorties du mois', value: '€ 3,180', color: 'text-foreground' },
                  { label: 'Prévision 30j', value: '€ 30,090', color: 'text-primary' },
                ].map((item) => (
                  <div key={item.label} className="bg-card rounded-xl p-3 sm:p-4 border border-border">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className={`text-lg sm:text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Pourquoi FlowDesk ?</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Conçu pour les freelances, startups et petites entreprises qui veulent voir clair dans leurs finances.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-border">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Tarifs simples et transparents</h2>
          <p className="text-muted-foreground text-center mb-12">Commence gratuitement, évolue quand tu es prêt.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3">Populaire</Badge>
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
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/register">
                      <Button
                        className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">F</span>
            </div>
            <span className="font-semibold text-sm">FlowDesk</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FlowDesk. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}