import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Calendar } from 'lucide-react';

const statusConfig = {
  brouillon: { label: 'Brouillon', className: 'bg-muted text-muted-foreground' },
  'vérifié': { label: 'Vérifié', className: 'bg-primary/10 text-primary' },
  'envoyé': { label: 'Envoyé', className: 'bg-accent/10 text-accent' },
};

const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR');
const formatAmount = (amt, curr) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: curr }).format(amt);

export default function StatementCard({ statement }) {
  const status = statusConfig[statement.status] || statusConfig.brouillon;
  const totals = statement.totals_by_currency || {};
  const currencies = Object.entries(totals);

  return (
    <Link to={`/statements/${statement.id}`}>
      <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{formatDate(statement.period_start)} — {formatDate(statement.period_end)}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={status.className}>{status.label}</Badge>
            <span className="text-xs text-muted-foreground">{currencies.length} devise{currencies.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="text-right">
          {currencies.map(([curr, amt]) => (
            <p key={curr} className="font-semibold">{formatAmount(amt, curr)}</p>
          ))}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </Card>
    </Link>
  );
}