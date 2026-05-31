import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import { Repeat, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const statusBadge = {
  active: 'bg-primary/10 text-primary border-primary/20',
  paused: 'bg-accent/10 text-accent border-accent/20',
  cancelled: 'bg-secondary text-muted-foreground border-border',
};

export default function SubscriptionsList({ subscriptions = [] }) {
  const active = subscriptions.filter((s) => s.status === 'active');

  if (active.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Abonnements actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Aucun abonnement enregistré</p>
            <Link to="/subscriptions" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">
              Ajouter ton premier abonnement →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Abonnements actifs</CardTitle>
        <Link to="/subscriptions" className="text-xs text-primary font-medium hover:underline">
          Tout voir
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-0">
          {active.slice(0, 5).map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-6 py-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-accent/10">
                <Repeat className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{sub.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Renouvelle {formatRelativeDate(sub.next_renewal)}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(sub.amount)}/{sub.cycle === 'monthly' ? 'mois' : 'an'}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}