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
import { Search } from 'lucide-react';
import { POPULAR_SERVICES } from '@/data/popularServices';

export default function SubscriptionModal({ open, onClose, onSave, editSub = null }) {
  const [form, setForm] = useState({
    name: editSub?.name || '',
    amount: editSub?.amount?.toString() || '',
    cycle: editSub?.cycle || 'monthly',
    next_renewal: editSub?.next_renewal?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: editSub?.status || 'active',
  });
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredServices = POPULAR_SERVICES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePickService = (service) => {
    setForm({ ...form, name: service.name, amount: service.amount.toString() });
    setSearch('');
    setShowSuggestions(false);
  };

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
          <DialogTitle>{editSub ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Label>Nom du service</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Recherche : Netflix, Figma, OpenAI, AWS..."
                className="pl-9"
                required
              />
            </div>
            {showSuggestions && filteredServices.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-popover shadow-md">
                {filteredServices.slice(0, 12).map((service) => (
                  <button
                    key={service.name}
                    type="button"
                    onMouseDown={() => handlePickService(service)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <img
                      src={service.logo}
                      alt={service.name}
                      className="w-5 h-5 object-contain flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="flex-1">{service.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {service.amount}€
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Montant (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Ex: 12.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cycle</Label>
              <Select value={form.cycle} onValueChange={(v) => setForm({ ...form, cycle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="yearly">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prochain renouvellement</Label>
            <Input
              type="date"
              value={form.next_renewal}
              onChange={(e) => setForm({ ...form, next_renewal: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              {editSub ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}