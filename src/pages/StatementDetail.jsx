import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LineItemTable from '@/components/statements/LineItemTable';
import ExportButtons from '@/components/statements/ExportButtons';

export default function StatementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statement, setStatement] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const stmt = await base44.entities.Statement.get(id);
      setStatement(stmt);
      const lineItems = await base44.entities.LineItem.filter({ statement: id }, 'date');
      setItems(lineItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleUpdateItem = async (itemId, data) => {
    await base44.entities.LineItem.update(itemId, data);
    const updated = items.map(i => i.id === itemId ? { ...i, ...data } : i);
    setItems(updated);
    const totals = {};
    updated.forEach(i => {
      const c = i.currency || 'EUR';
      totals[c] = (totals[c] || 0) + i.amount;
    });
    setStatement(prev => ({ ...prev, totals_by_currency: totals }));
    await base44.entities.Statement.update(id, { totals_by_currency: totals });
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Chargement...</div>;
  if (!statement) return <div className="p-6 text-center text-muted-foreground">Relevé introuvable</div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR');
  const unverifiedCount = items.filter(i => !i.verified).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/statements')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Relevé {formatDate(statement.period_start)} — {formatDate(statement.period_end)}</h1>
          <p className="text-sm text-muted-foreground">{items.length} ligne(s) · {unverifiedCount} à vérifier</p>
        </div>
      </div>

      <LineItemTable items={items} onUpdate={handleUpdateItem} />
      <ExportButtons statement={statement} items={items} />
    </div>
  );
}