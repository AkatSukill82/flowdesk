import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const paymentStatuses = [
  { value: 'paid', label: '✅ Payée' },
  { value: 'pending', label: '⏳ En attente' },
  { value: 'overdue', label: '🔴 En retard' },
];

const categories = [
  { value: 'income', label: 'Entrée' },
  { value: 'salary', label: 'Salaire' },
  { value: 'subscription', label: 'Abonnement' },
  { value: 'tax', label: 'Impôts & Taxes' },
  { value: 'expense', label: 'Dépense' },
  { value: 'transfer', label: 'Transfert' },
  { value: 'other', label: 'Autre' },
];

export default function TransactionModal({ open, onClose, onSave, accounts = [], editTx = null }) {
  const [form, setForm] = useState({
    label: editTx?.label || '',
    amount: editTx?.amount?.toString() || '',
    category: editTx?.category || 'expense',
    date: editTx?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    account_id: editTx?.account_id || accounts[0]?.id || '',
    note: editTx?.note || '',
    source: 'manual',
    payment_status: editTx?.payment_status || 'paid',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      amount: parseFloat(form.amount),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editTx ? 'Modifier la transaction' : 'Nouvelle transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Libellé</Label>
            <Input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ex: Facture client, Loyer bureau..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Montant (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Ex: 1500 ou -250"
                required
              />
              <p className="text-xs text-muted-foreground">Positif = entrée, négatif = sortie</p>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Compte</Label>
              <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Statut de paiement</Label>
            <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Note (optionnel)</Label>
            <Textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Détails supplémentaires..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              {editTx ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}