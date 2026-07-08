import LineItemRow from './LineItemRow';

const CATEGORIES = ['Logiciel/SaaS', 'Hébergement', 'Abonnement', 'Assurance', 'Matériel', 'Autre'];

export default function LineItemTable({ items, onUpdate }) {
  const totals = {};
  items.forEach(i => {
    const c = i.currency || 'EUR';
    totals[c] = (totals[c] || 0) + i.amount;
  });

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Marchand</th>
              <th className="px-3 py-2 font-medium text-right">Montant</th>
              <th className="px-3 py-2 font-medium">Catégorie</th>
              <th className="px-3 py-2 font-medium text-center">Vérifié</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <LineItemRow key={item.id} item={item} onUpdate={onUpdate} categories={CATEGORIES} />
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Aucune ligne détectée</td></tr>
            )}
          </tbody>
          <tfoot className="bg-muted/30">
            {Object.entries(totals).map(([curr, amt]) => (
              <tr key={curr}>
                <td colSpan={2} className="px-3 py-2 font-medium text-right">Total {curr}</td>
                <td className="px-3 py-2 font-semibold text-right">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: curr }).format(amt)}
                </td>
                <td colSpan={2}></td>
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </div>
  );
}