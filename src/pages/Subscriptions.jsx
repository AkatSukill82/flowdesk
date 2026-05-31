import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
import SubscriptionModal from '@/components/subscriptions/SubscriptionModal';

export default function Subscriptions() {
  const [showModal, setShowModal] = useState(false);
  const [editSub, setEditSub] = useState(null);
  const queryClient = useQueryClient();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const handleSave = (data) => {
    if (editSub) {
      updateMutation.mutate({ id: editSub.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditSub(null);
  };

  const handleStatusChange = (id, status) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((s, sub) => {
    return s + (sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount);
  }, 0);
  const yearlyTotal = monthlyTotal * 12;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Abonnements</h1>
          <p className="text-sm text-muted-foreground">
            {activeSubs.length} actif{activeSubs.length > 1 ? 's' : ''} · {formatCurrency(monthlyTotal)}/mois · {formatCurrency(yearlyTotal)}/an
          </p>
        </div>
        <Button onClick={() => { setEditSub(null); setShowModal(true); }} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Aucun abonnement enregistré</p>
          <Button
            variant="link"
            className="text-primary mt-2"
            onClick={() => { setEditSub(null); setShowModal(true); }}
          >
            Ajouter ton premier abonnement →
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub, i) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              index={i}
              onEdit={(s) => { setEditSub(s); setShowModal(true); }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <SubscriptionModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditSub(null); }}
        onSave={handleSave}
        editSub={editSub}
      />
    </div>
  );
}