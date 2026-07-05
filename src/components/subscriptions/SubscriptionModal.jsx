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

const POPULAR_SERVICES = [
  { name: 'Netflix', defaultAmount: 13.49, icon: '🎬' },
  { name: 'Spotify', defaultAmount: 10.99, icon: '🎵' },
  { name: 'Amazon Prime', defaultAmount: 6.99, icon: '📦' },
  { name: 'Disney+', defaultAmount: 8.99, icon: '✨' },
  { name: 'Apple Music', defaultAmount: 10.99, icon: '🎶' },
  { name: 'Apple TV+', defaultAmount: 9.99, icon: '📺' },
  { name: 'Apple iCloud', defaultAmount: 2.99, icon: '☁️' },
  { name: 'YouTube Premium', defaultAmount: 11.99, icon: '▶️' },
  { name: 'Figma', defaultAmount: 12.00, icon: '🎨' },
  { name: 'Notion', defaultAmount: 8.00, icon: '📝' },
  { name: 'Slack', defaultAmount: 7.25, icon: '💬' },
  { name: 'Microsoft 365', defaultAmount: 7.00, icon: '📊' },
  { name: 'Adobe Creative Cloud', defaultAmount: 59.99, icon: '🖌️' },
  { name: 'Canva Pro', defaultAmount: 10.99, icon: '🖼️' },
  { name: 'Google One', defaultAmount: 1.99, icon: '💾' },
  { name: 'Google Workspace', defaultAmount: 5.40, icon: '🗓️' },
  { name: 'ChatGPT Plus', defaultAmount: 20.00, icon: '🤖' },
  { name: 'GitHub Copilot', defaultAmount: 10.00, icon: '🐙' },
  { name: 'AWS', defaultAmount: 0.50, icon: '☁️' },
  { name: 'Dropbox', defaultAmount: 9.99, icon: '📁' },
  { name: 'Zoom', defaultAmount: 13.99, icon: '📹' },
  { name: 'Trello', defaultAmount: 5.00, icon: '📋' },
  { name: 'LinkedIn Premium', defaultAmount: 29.99, icon: '💼' },
  { name: 'Coursera Plus', defaultAmount: 49.00, icon: '🎓' },
  { name: 'Deezer', defaultAmount: 10.99, icon: '🎼' },
  { name: 'Canal+', defaultAmount: 20.99, icon: '📡' },
  { name: 'Gymshark', defaultAmount: 19.99, icon: '💪' },
  { name: 'Basic-Fit', defaultAmount: 29.99, icon: '🏋️' },
  { name: 'Headspace', defaultAmount: 12.99, icon: '🧘' },
  { name: 'Duolingo Plus', defaultAmount: 7.99, icon: '🦉' },
];

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
    setForm({ ...form, name: service.name, amount: service.defaultAmount.toString() });
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
                placeholder="Ex: Figma, AWS, Notion..."
                className="pl-9"
                required
              />
            </div>
            {showSuggestions && filteredServices.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border bg-popover shadow-md">
                {filteredServices.slice(0, 8).map((service) => (
                  <button
                    key={service.name}
                    type="button"
                    onMouseDown={() => handlePickService(service)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <span className="text-lg">{service.icon}</span>
                    <span className="flex-1">{service.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {service.defaultAmount}€
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