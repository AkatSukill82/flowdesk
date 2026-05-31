import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Briefcase,
  CreditCard,
  Repeat,
  Building2,
  ArrowLeftRight,
  Trash2,
  Pencil,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionModal from '@/components/transactions/TransactionModal';

const categoryIcons = {
  income: ArrowUpRight,
  salary: Briefcase,
  subscription: Repeat,
  tax: Building2,
  expense: ShoppingCart,
  transfer: ArrowLeftRight,
  other: CreditCard,
};

const categoryLabels = {
  income: 'Entrée',
  salary: 'Salaire',
  subscription: 'Abonnement',
  tax: 'Impôts',
  expense: 'Dépense',
  transfer: 'Transfert',
  other: 'Autre',
};

const categoryColors = {
  income: 'bg-primary/10 text-primary border-primary/20',
  salary: 'bg-primary/10 text-primary border-primary/20',
  subscription: 'bg-accent/10 text-accent border-accent/20',
  tax: 'bg-destructive/10 text-destructive border-destructive/20',
  expense: 'bg-secondary text-muted-foreground border-border',
  transfer: 'bg-secondary text-muted-foreground border-border',
  other: 'bg-secondary text-muted-foreground border-border',
};

export default function Transactions() {
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 500),
    initialData: [],
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const handleSave = (data) => {
    if (editTx) {
      updateMutation.mutate({ id: editTx.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditTx(null);
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = !search || t.label?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchAccount = filterAccount === 'all' || t.account_id === filterAccount;
      return matchSearch && matchCategory && matchAccount;
    });
  }, [transactions, search, filterCategory, filterAccount]);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">{transactions.length} transactions enregistrées</p>
        </div>
        <Button onClick={() => { setEditTx(null); setShowModal(true); }} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Compte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les comptes</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucune transaction trouvée</p>
              <Button
                variant="link"
                className="text-primary mt-2"
                onClick={() => { setEditTx(null); setShowModal(true); }}
              >
                Ajouter ta première transaction →
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence>
                {filtered.map((tx, i) => {
                  const Icon = categoryIcons[tx.category] || CreditCard;
                  const isIncome = tx.amount > 0;
                  const account = accounts.find((a) => a.id === tx.account_id);

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 px-4 lg:px-6 py-3.5 hover:bg-secondary/40 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg ${isIncome ? 'bg-primary/10' : 'bg-secondary'}`}>
                        <Icon className={`w-4 h-4 ${isIncome ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                          {account && (
                            <span className="text-xs text-muted-foreground">· {account.name}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={`hidden sm:flex ${categoryColors[tx.category] || ''} text-xs`}>
                        {categoryLabels[tx.category] || tx.category}
                      </Badge>
                      <span className={`text-sm font-semibold tabular-nums min-w-[80px] text-right ${isIncome ? 'text-primary' : 'text-foreground'}`}>
                        {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => { setEditTx(tx); setShowModal(true); }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteMutation.mutate(tx.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditTx(null); }}
        onSave={handleSave}
        accounts={accounts}
        editTx={editTx}
      />
    </div>
  );
}