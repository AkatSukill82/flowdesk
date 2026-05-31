import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import { Pencil, Pause, Play, XCircle, Calendar, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig = {
  active: { label: 'Actif', class: 'bg-primary/10 text-primary border-primary/20' },
  paused: { label: 'En pause', class: 'bg-accent/10 text-accent border-accent/20' },
  cancelled: { label: 'Annulé', class: 'bg-secondary text-muted-foreground border-border' },
};

export default function SubscriptionCard({ subscription, onEdit, onStatusChange, index = 0 }) {
  const status = statusConfig[subscription.status] || statusConfig.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Repeat className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{subscription.name}</h3>
                <Badge variant="outline" className={`mt-1 text-xs ${status.class}`}>
                  {status.label}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatCurrency(subscription.amount)}</p>
              <p className="text-xs text-muted-foreground">
                / {subscription.cycle === 'monthly' ? 'mois' : 'an'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>Renouvelle {formatRelativeDate(subscription.next_renewal)}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onEdit(subscription)}>
              <Pencil className="w-3 h-3 mr-1" /> Modifier
            </Button>
            {subscription.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onStatusChange(subscription.id, 'paused')}
              >
                <Pause className="w-3 h-3" />
              </Button>
            )}
            {subscription.status === 'paused' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onStatusChange(subscription.id, 'active')}
              >
                <Play className="w-3 h-3" />
              </Button>
            )}
            {subscription.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-destructive hover:text-destructive"
                onClick={() => onStatusChange(subscription.id, 'cancelled')}
              >
                <XCircle className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}