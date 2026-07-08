import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '';

export default function LineItemRow({ item, onUpdate, categories }) {
  const [vendor, setVendor] = useState(item.vendor || '');
  const [amount, setAmount] = useState(item.amount?.toString() || '');
  const [category, setCategory] = useState(item.category || 'Autre');

  const saveField = (field, value) => {
    if (field === 'amount') value = parseFloat(value);
    if (value === item[field]) return;
    onUpdate(item.id, { [field]: value });
  };

  return (
    <tr className={`border-t ${!item.verified ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</td>
      <td className="px-3 py-2">
        <Input
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          onBlur={() => saveField('vendor', vendor)}
          className="h-8 border-transparent hover:border-input"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center justify-end gap-1">
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => saveField('amount', amount)}
            className="h-8 w-24 text-right border-transparent hover:border-input"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.currency || 'EUR'}</span>
        </div>
      </td>
      <td className="px-3 py-2">
        <Select value={category} onValueChange={(v) => { setCategory(v); saveField('category', v); }}>
          <SelectTrigger className="h-8 border-transparent hover:border-input"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center justify-center gap-2">
          {!item.verified && <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs">À vérifier</Badge>}
          <Checkbox
            checked={item.verified}
            onCheckedChange={(v) => onUpdate(item.id, { verified: v })}
          />
        </div>
      </td>
    </tr>
  );
}