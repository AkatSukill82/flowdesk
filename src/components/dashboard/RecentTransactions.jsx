import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Briefcase,
  CreditCard,
  Repeat,
  Building2,
  ArrowLeftRight,
  MoreHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categoryIcons = {
  income: ArrowUpRight,
  salary: Briefcase,
  subscription: Repeat,
  tax: Building2,
  expense: ShoppingCart,
  transfer: ArrowLeftRight,
  other: CreditCard,
};

export default function RecentTransactions({ transactions = [] }) {
  const recent = transactions.slice(0, 10);

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Dernières transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Aucune transaction pour le moment</p>
            <Link
              to="/transactions"
              className="text-primary text-sm font-medium mt-2 inline-block hover:underline"
            >
              Ajouter ta première transaction →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Dernières transactions</CardTitle>
        <Link to="/transactions" className="text-xs text-primary font-medium hover:underline">
          Tout voir
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-0">
          {recent.map((tx, i) => {
            const Icon = categoryIcons[tx.category] || CreditCard;
            const isIncome = tx.amount > 0;

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-6 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${isIncome ? 'bg-primary/10' : 'bg-secondary'}`}>
                  <Icon className={`w-4 h-4 ${isIncome ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-primary' : 'text-foreground'}`}>
                  {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}