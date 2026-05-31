import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  ArrowRight,
  ArrowLeft,
  Plus,
  Repeat,
  Check,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState({ name: '', type: 'bank', currency: 'EUR', balance: '' });
  const [transactions, setTransactions] = useState([]);
  const [txForm, setTxForm] = useState({ label: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [subscriptions, setSubscriptions] = useState([]);
  const [subForm, setSubForm] = useState({ name: '', amount: '', cycle: 'monthly', next_renewal: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { title: 'Ton premier compte', icon: Wallet },
    { title: 'Tes dernières transactions', icon: ArrowRight },
    { title: 'Tes abonnements', icon: Repeat },
    { title: 'Tableau de bord prêt !', icon: Sparkles },
  ];

  const addTransaction = () => {
    if (!txForm.label || !txForm.amount) return;
    setTransactions([...transactions, { ...txForm, amount: parseFloat(txForm.amount) }]);
    setTxForm({ label: '', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  const addSubscription = () => {
    if (!subForm.name || !subForm.amount) return;
    setSubscriptions([...subscriptions, { ...subForm, amount: parseFloat(subForm.amount), status: 'active' }]);
    setSubForm({ name: '', amount: '', cycle: 'monthly', next_renewal: '' });
  };

  const handleFinish = async () => {
    setSaving(true);

    // Create account
    const createdAccount = await base44.entities.Account.create({
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: parseFloat(account.balance) || 0,
    });

    // Create transactions
    if (transactions.length > 0) {
      await base44.entities.Transaction.bulkCreate(
        transactions.map((t) => ({
          ...t,
          account_id: createdAccount.id,
          category: t.amount >= 0 ? 'income' : 'expense',
          source: 'manual',
        }))
      );
    }

    // Create subscriptions
    if (subscriptions.length > 0) {
      await base44.entities.Subscription.bulkCreate(subscriptions);
    }

    // Mark onboarding complete
    await base44.auth.updateMe({ onboarding_complete: true });

    setSaving(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary text-primary-foreground' :
                'bg-secondary text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-1">{steps[step].title}</h2>

                {/* Step 0: Account */}
                {step === 0 && (
                  <div className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">Ajoute ton compte principal pour commencer le suivi.</p>
                    <div className="space-y-2">
                      <Label>Nom du compte</Label>
                      <Input value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} placeholder="Ex: ING Bank, Stripe..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={account.type} onValueChange={(v) => setAccount({ ...account, type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank">Banque</SelectItem>
                            <SelectItem value="payment_processor">Processeur de paiement</SelectItem>
                            <SelectItem value="cash">Espèces</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Solde actuel (€)</Label>
                        <Input type="number" value={account.balance} onChange={(e) => setAccount({ ...account, balance: e.target.value })} placeholder="Ex: 5000" />
                      </div>
                    </div>
                    <Button onClick={() => setStep(1)} disabled={!account.name} className="w-full bg-primary hover:bg-primary/90 gap-2 mt-2">
                      Continuer <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Step 1: Transactions */}
                {step === 1 && (
                  <div className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">Ajoute tes 3 dernières transactions (ou plus).</p>
                    <div className="flex gap-2">
                      <Input value={txForm.label} onChange={(e) => setTxForm({ ...txForm, label: e.target.value })} placeholder="Libellé" className="flex-1" />
                      <Input type="number" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} placeholder="Montant" className="w-28" />
                      <Button onClick={addTransaction} size="icon" variant="outline"><Plus className="w-4 h-4" /></Button>
                    </div>
                    {transactions.length > 0 && (
                      <div className="space-y-1.5">
                        {transactions.map((t, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-secondary rounded-lg text-sm">
                            <span>{t.label}</span>
                            <div className="flex items-center gap-2">
                              <span className={t.amount >= 0 ? 'text-primary font-medium' : 'font-medium'}>
                                {t.amount >= 0 ? '+' : ''}€{Math.abs(t.amount)}
                              </span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTransactions(transactions.filter((_, j) => j !== i))}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(0)} className="flex-1 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Retour
                      </Button>
                      <Button onClick={() => setStep(2)} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                        Continuer <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Subscriptions */}
                {step === 2 && (
                  <div className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">Ajoute tes abonnements récurrents.</p>
                    <div className="flex gap-2">
                      <Input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="Nom" className="flex-1" />
                      <Input type="number" value={subForm.amount} onChange={(e) => setSubForm({ ...subForm, amount: e.target.value })} placeholder="€/mois" className="w-24" />
                      <Button onClick={addSubscription} size="icon" variant="outline"><Plus className="w-4 h-4" /></Button>
                    </div>
                    {subscriptions.length > 0 && (
                      <div className="space-y-1.5">
                        {subscriptions.map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-secondary rounded-lg text-sm">
                            <span>{s.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">€{s.amount}/mois</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSubscriptions(subscriptions.filter((_, j) => j !== i))}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Retour
                      </Button>
                      <Button onClick={() => setStep(3)} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                        Continuer <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Finish */}
                {step === 3 && (
                  <div className="space-y-4 mt-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tout est prêt ! Ton tableau de bord va afficher ta première prévision financière.
                    </p>
                    <div className="text-left space-y-2 bg-secondary rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Compte</span>
                        <span className="font-medium">{account.name || '—'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transactions</span>
                        <span className="font-medium">{transactions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Abonnements</span>
                        <span className="font-medium">{subscriptions.length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Retour
                      </Button>
                      <Button onClick={handleFinish} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                        {saving ? 'Enregistrement...' : 'Voir mon tableau de bord'} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}