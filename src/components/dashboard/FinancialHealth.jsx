import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { motion } from 'framer-motion';

export default function FinancialHealth({ transactions = [], totalBalance = 0 }) {
  const now = new Date();

  // Monthly net for current month
  const currentMonthTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyNet = currentMonthTxns.reduce((s, t) => s + t.amount, 0);

  // Average monthly net over last 3 months
  const last3MonthsNets = [];
  for (let i = 1; i <= 3; i++) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    });
    last3MonthsNets.push(mTxns.reduce((s, t) => s + t.amount, 0));
  }
  const avgNet = last3MonthsNets.length > 0
    ? last3MonthsNets.reduce((s, n) => s + n, 0) / last3MonthsNets.length
    : 0;

  const forecast30 = totalBalance + avgNet;

  // Health score
  let healthScore = 100;
  if (forecast30 < 0) healthScore -= 40;
  else if (forecast30 < 500) healthScore -= 20;
  if (monthlyNet < 0) healthScore -= 20;
  if (totalBalance < 200) healthScore -= 20;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const healthColor =
    healthScore >= 70 ? 'text-primary' : healthScore >= 40 ? 'text-accent' : 'text-destructive';
  const healthBg =
    healthScore >= 70 ? 'bg-primary/10' : healthScore >= 40 ? 'bg-accent/10' : 'bg-destructive/10';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="grid grid-cols-3 gap-4">
          {/* Monthly Net */}
          <div className="text-center space-y-1.5">
            <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${monthlyNet >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              {monthlyNet >= 0 ? (
                <TrendingUp className="w-5 h-5 text-primary" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
            </div>
            <p className="text-lg font-bold">{formatCurrency(monthlyNet)}</p>
            <p className="text-xs text-muted-foreground">Net ce mois</p>
          </div>

          {/* 30-day Forecast */}
          <div className="text-center space-y-1.5">
            <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${forecast30 >= 500 ? 'bg-primary/10' : 'bg-accent/10'}`}>
              <Target className={`w-5 h-5 ${forecast30 >= 500 ? 'text-primary' : 'text-accent'}`} />
            </div>
            <p className="text-lg font-bold">{formatCurrency(forecast30)}</p>
            <p className="text-xs text-muted-foreground">Prévision 30j</p>
          </div>

          {/* Health Score */}
          <div className="text-center space-y-1.5">
            <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${healthBg}`}>
              <span className={`text-lg font-bold ${healthColor}`}>{healthScore}</span>
            </div>
            <p className={`text-lg font-bold ${healthColor}`}>/100</p>
            <p className="text-xs text-muted-foreground">Santé financière</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}