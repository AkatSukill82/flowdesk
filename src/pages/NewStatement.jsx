import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { GMAIL_CONNECTOR_ID } from '@/lib/gmailConnector';
import { useToast } from '@/components/ui/use-toast';

export default function NewStatement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const checkConnection = async () => {
    try {
      const res = await base44.functions.invoke('generateStatement', { checkOnly: true });
      setConnected(res.data.connected === true);
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) await checkConnection();
      setLoading(false);
    });
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const url = await base44.connectors.connectAppUser(GMAIL_CONNECTOR_ID);
      const popup = window.open(url, '_blank');
      if (!popup) {
        toast({ title: 'Popup bloquée', description: 'Autorisez les popups puis réessayez', variant: 'destructive' });
        return;
      }
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          checkConnection();
        }
      }, 500);
    } catch (e) {
      toast({ title: 'Erreur de connexion', description: e.message, variant: 'destructive' });
    } finally {
      setConnecting(false);
    }
  };

  const handleScan = async () => {
    if (!periodStart || !periodEnd) {
      toast({ title: 'Sélectionnez une période', variant: 'destructive' });
      return;
    }
    setScanning(true);
    try {
      const res = await base44.functions.invoke('generateStatement', { periodStart, periodEnd });
      toast({ title: `${res.data.line_count} paiement(s) détecté(s)` });
      navigate(`/statements/${res.data.statement_id}`);
    } catch (e) {
      toast({ title: 'Erreur lors du scan', description: e.response?.data?.error || e.message, variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau relevé</h1>
        <p className="text-sm text-muted-foreground">Scannez vos emails de paiement sur une période donnée</p>
      </div>

      {!connected ? (
        <div className="border border-dashed rounded-xl p-8 text-center space-y-4">
          <Mail className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <div>
            <p className="font-medium">Connectez votre boîte Gmail</p>
            <p className="text-sm text-muted-foreground">Lecture seule — nous ne modifions aucun email</p>
          </div>
          <Button onClick={handleConnect} disabled={connecting} className="gap-2">
            {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {connecting ? 'Connexion...' : 'Connecter Gmail'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="w-4 h-4" />Gmail connecté
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Début de période</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fin de période</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleScan} disabled={scanning} className="w-full gap-2">
            {scanning ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Scan en cours... Cela peut prendre un moment</>
            ) : (
              <><Search className="w-4 h-4" />Scanner Gmail</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}