import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  TrendingDown,
  Wallet,
  Repeat,
  Target,
  Bell,
  Check,
  CheckCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { motion } from 'framer-motion';

const alertConfig = {
  low_balance: { icon: Wallet, color: 'text-destructive', bg: 'bg-destructive/10' },
  renewal_soon: { icon: Repeat, color: 'text-accent', bg: 'bg-accent/10' },
  spending_spike: { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
  forecast_warning: { icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
  custom: { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' },
};

export default function Alerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-triggered_at'),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['unread-alerts-count'] });
    },
  });

  const markAsRead = (id) => {
    updateMutation.mutate({ id, data: { is_read: true } });
  };

  const markAllRead = () => {
    alerts.filter((a) => !a.is_read).forEach((a) => {
      updateMutation.mutate({ id: a.id, data: { is_read: true } });
    });
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const sorted = [...alerts].sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    return new Date(b.triggered_at) - new Date(a.triggered_at);
  });

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alertes</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} alerte${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Tout est sous contrôle ✨'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2 text-xs">
            <CheckCheck className="w-3.5 h-3.5" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune alerte pour le moment</p>
          <p className="text-xs text-muted-foreground mt-1">Les alertes apparaîtront automatiquement quand un risque est détecté</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((alert, i) => {
            const config = alertConfig[alert.type] || alertConfig.custom;
            const Icon = config.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={`transition-all cursor-pointer hover:shadow-sm ${
                    !alert.is_read ? 'border-l-4 border-l-accent' : 'opacity-60'
                  }`}
                  onClick={() => !alert.is_read && markAsRead(alert.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!alert.is_read ? 'font-medium' : 'text-muted-foreground'}`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(alert.triggered_at || alert.created_date)}
                      </p>
                    </div>
                    {!alert.is_read && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={(e) => { e.stopPropagation(); markAsRead(alert.id); }}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}