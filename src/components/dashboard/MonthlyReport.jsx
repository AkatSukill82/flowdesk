import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function MonthlyReport({ transactions }) {
  const report = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();
    const pm = cm === 0 ? 11 : cm - 1;
    const py = cm === 0 ? cy - 1 : cy;

    const filter = (m, y) => transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const calcStats = (txns) => ({
      income: txns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      expenses: Math.abs(txns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)),
    });

    const current = calcStats(filter(cm, cy));
    const previous = calcStats(filter(pm, py));

    const delta = (curr, prev) => prev === 0 ? null : ((curr - prev) / prev) * 100;

    const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

    return {
      currentMonth: monthNames[cm],
      previousMonth: monthNames[pm],
      current,
      previous,
      incomeDelta: delta(current.income, previous.income),
      expensesDelta: delta(current.expenses, previous.expenses),
      net: current.income - current.expenses,
      prevNet: previous.income - previous.expenses,
    };
  }, [transactions]);

  const DeltaBadge = ({ delta, inverse = false }) => {
    if (delta === null) return null;
    const isPositive = inverse ? delta < 0 : delta > 0;
    const Icon = delta === 0 ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
        isPositive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
      }`}>
        <Icon className="w-3 h-3" />
        {Math.abs(delta).toFixed(1)}%
      </span>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          📊 Rapport mensuel — {report.currentMonth}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Comparé à {report.previousMonth}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Income */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Entrées</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(report.current.income)}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <DeltaBadge delta={report.incomeDelta} />
              <span className="text-xs text-muted-foreground">vs {formatCurrency(report.previous.income)}</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs text-muted-foreground font-medium">Sorties</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(report.current.expenses)}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <DeltaBadge delta={report.expensesDelta} inverse />
              <span className="text-xs text-muted-foreground">vs {formatCurrency(report.previous.expenses)}</span>
            </div>
          </div>
        </div>

        {/* Net */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${
          report.net >= 0 ? 'bg-primary/5 border-primary/10' : 'bg-destructive/5 border-destructive/10'
        }`}>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Solde net du mois</p>
            <p className={`text-xl font-bold ${report.net >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {report.net >= 0 ? '+' : ''}{formatCurrency(report.net)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{report.previousMonth}</p>
            <p className="text-sm font-medium text-muted-foreground">
              {report.prevNet >= 0 ? '+' : ''}{formatCurrency(report.prevNet)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}