import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatementCard from '@/components/statements/StatementCard';

export default function Statements() {
  const { data: statements = [], isLoading } = useQuery({
    queryKey: ['statements'],
    queryFn: () => base44.entities.Statement.list('-generated_at', 50),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relevés de paiements</h1>
          <p className="text-sm text-muted-foreground">Générés depuis votre boîte Gmail</p>
        </div>
        <Link to="/statements/new">
          <Button className="gap-2"><Plus className="w-4 h-4" />Nouveau relevé</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : statements.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucun relevé pour le moment</p>
          <Link to="/statements/new"><Button variant="outline" className="mt-4">Créer le premier</Button></Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {statements.map((s) => <StatementCard key={s.id} statement={s} />)}
        </div>
      )}
    </div>
  );
}