import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import { Pencil, Pause, Play, XCircle, Calendar, Repeat, CreditCard, Loader2, Check, ShieldOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { POPULAR_SERVICES } from '@/data/popularServices';

const statusConfig = {
  active: { label: 'Actif', class: 'bg-primary/10 text-primary border-primary/20' },
  paused: { label: 'En pause', class: 'bg-accent/10 text-accent border-accent/20' },
  cancelled: { label: 'Annulé', class: 'bg-secondary text-muted-foreground border-border' },
};

export default function SubscriptionCard({ subscription, onEdit, onStatusChange, onAutopayChanged, index = 0 }) {
  const status = statusConfig[subscription.status] || statusConfig.active;
  const { toast } = useToast();
  const matchedService = POPULAR_SERVICES.find(
    (s) => s.name.toLowerCase() === subscription.name?.toLowerCase()
  );
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const autopay = subscription.autopay_status || 'none';

  const handleSetupAutopay = async () => {
    setLoadingSetup(true);
    try {
      const res = await base44.functions.invoke('create-checkout', {
        subscription_id: subscription.id,
      });
      if (res?.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        throw new Error(res?.data?.error || 'Pas d\'URL de redirection');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de lancer le paiement',
      });
      setLoadingSetup(false);
    }
  };

  const handleCancelAutopay = async () => {
    setLoadingCancel(true);
    try {
      await base44.functions.invoke('cancel-subscription', {
        subscription_id: subscription.id,
      });
      toast({
        title: 'Prélèvement désactivé',
        description: 'Les futurs débits automatiques sont annulés.',
      });
      onAutopayChanged?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Échec de la désactivation',
      });
    } finally {
      setLoadingCancel(false);
    }
  };

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
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center overflow-hidden">
                {matchedService ? (
                  <img
                    src={matchedService.logo}
                    alt={subscription.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <Repeat
                  className={`w-5 h-5 text-accent ${matchedService ? 'hidden' : ''}`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{subscription.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className={`text-xs ${status.class}`}>
                    {status.label}
                  </Badge>
                  {autopay === 'active' && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      <Check className="w-3 h-3 mr-0.5" /> Auto
                    </Badge>
                  )}
                  {autopay === 'pending' && (
                    <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                      En attente
                    </Badge>
                  )}
                </div>
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

          {autopay === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs mb-2 text-destructive hover:text-destructive"
              disabled={loadingCancel}
              onClick={handleCancelAutopay}
            >
              {loadingCancel ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ShieldOff className="w-3 h-3 mr-1" />}
              Désactiver le prélèvement auto
            </Button>
          ) : autopay !== 'pending' && (
            <Button
              size="sm"
              className="w-full text-xs mb-2"
              disabled={loadingSetup}
              onClick={handleSetupAutopay}
            >
              {loadingSetup ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CreditCard className="w-3 h-3 mr-1" />}
              Activer le prélèvement auto
            </Button>
          )}

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