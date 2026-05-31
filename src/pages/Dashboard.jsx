import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, Repeat } from 'lucide-react';
import { formatCurrency, getGreeting } from '@/lib/formatters';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

import KPICard from '@/components/dashboard/KPICard';
import AlertBanner from '@/components/dashboard/AlertBanner';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SubscriptionsList from '@/components/dashboard/SubscriptionsList';
import FinancialHealth from '@/components/dashboard/FinancialHealth';
import MonthlyReport from '@/components/dashboard/MonthlyReport';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
    initialData: [],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 200),
    initialData: [],
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: [],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-triggered_at'),
    initialData: [],
  });

  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

    const now = new Date();
    const thisMonthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const monthlyIncome = thisMonthTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const monthlyExpenses = Math.abs(thisMonthTxns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));

    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const subsTotal = activeSubs.reduce((s, sub) => {
      return s + (sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount);
    }, 0);

    return { totalBalance, monthlyIncome, monthlyExpenses, subsTotal };
  }, [accounts, transactions, subscriptions]);

  const unreadAlert = alerts.find((a) => !a.is_read);
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold">
          {getGreeting()} {user?.full_name?.split(' ')[0] || ''}, voici ta situation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de tes finances</p>
      </motion.div>

      {/* Alert Banner */}
      <AlertBanner alert={unreadAlert} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KPICard
          title="Solde total"
          value={formatCurrency(stats.totalBalance)}
          icon={Wallet}
          variant="primary"
        />
        <KPICard
          title="Entrées du mois"
          value={formatCurrency(stats.monthlyIncome)}
          icon={TrendingUp}
        />
        <KPICard
          title="Sorties du mois"
          value={formatCurrency(stats.monthlyExpenses)}
          icon={TrendingDown}
        />
        <KPICard
          title="Abonnements / mois"
          value={formatCurrency(stats.subsTotal)}
          icon={Repeat}
          variant="accent"
        />
      </div>

      {/* Financial Health */}
      <FinancialHealth transactions={transactions} totalBalance={stats.totalBalance} />

      {/* Chart */}
      <RevenueChart transactions={transactions} />

      {/* Monthly Report */}
      <MonthlyReport transactions={transactions} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <RecentTransactions transactions={sortedTransactions} />
        <SubscriptionsList subscriptions={subscriptions} />
      </div>
    </div>
  );
}