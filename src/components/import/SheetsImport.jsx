import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Check, AlertTriangle, Link, Unlink, Sheet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { motion } from 'framer-motion';

const CONNECTOR_ID = '6a1b8ef08e6292baf607ea7d';

export default function SheetsImport({ accounts }) {
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [preview, setPreview] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState('');

  // Rule 2: reusable fetch to check connection
  const checkConnection = async () => {
    try {
      await base44.functions.invoke('importFromSheets', { spreadsheetId: 'ping' });
      setConnected(true);
    } catch (e) {
      // If it's a "not connected" error vs a spreadsheet error
      if (e?.response?.status === 401 || String(e?.message).includes('connect')) {
        setConnected(false);
      } else {
        setConnected(true); // Connected but spreadsheet invalid — that's fine
      }
    }
  };

  // Rule 1: check auth on mount
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        await checkConnection();
      }
      setCheckingAuth(false);
    });
  }, []);

  // Rule 3: connect via popup, poll for close
  const handleConnect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        checkConnection();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setPreview([]);
  };

  const extractId = (input) => {
    // Accept full URL or raw ID
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : input.trim();
  };

  const handleFetch = async () => {
    setError('');
    setPreview([]);
    setImported(false);
    const id = extractId(spreadsheetId);
    if (!id) { setError('Veuillez entrer un ID ou URL de feuille.'); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('importFromSheets', { spreadsheetId: id, sheetName });
      setPreview(res.data.rows || []);
      if ((res.data.rows || []).length === 0) setError('Aucune transaction trouvée. Vérifie le nom de l\'onglet et les en-têtes.');
    } catch (e) {
      setError(e?.response?.data?.error || 'Erreur lors de la récupération des données.');
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!selectedAccount || preview.length === 0) return;
    setImporting(true);
    const data = preview.map((row) => ({ ...row, account_id: selectedAccount }));
    await base44.entities.Transaction.bulkCreate(data);
    setImporting(false);
    setImported(true);
  };

  if (checkingAuth) return null;

  if (!user) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground mb-3">Connectez-vous pour utiliser l'import Google Sheets.</p>
        <Button onClick={() => base44.auth.redirectToLogin()}>Se connecter</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Connection status */}
      <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
        <div className="flex items-center gap-2 text-sm">
          <Sheet className="w-4 h-4 text-primary" />
          <span className="font-medium">Google Sheets</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {connected ? 'Connecté' : 'Non connecté'}
          </span>
        </div>
        {connected ? (
          <Button size="sm" variant="outline" onClick={handleDisconnect} className="gap-1 text-xs">
            <Unlink className="w-3 h-3" /> Déconnecter
          </Button>
        ) : (
          <Button size="sm" onClick={handleConnect} className="gap-1 text-xs">
            <Link className="w-3 h-3" /> Connecter Google
          </Button>
        )}
      </div>

      {connected && (
        <>
          <div className="space-y-3">
            <Label>URL ou ID du classeur Google Sheets</Label>
            <Input
              placeholder="https://docs.google.com/spreadsheets/d/... ou l'ID brut"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Nom de l'onglet (optionnel)</Label>
            <Input
              placeholder="ex: Janvier 2025 — laisser vide pour le premier onglet"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
          </div>

          <Button onClick={handleFetch} disabled={!spreadsheetId || loading} className="w-full gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</> : 'Récupérer les données'}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {preview.length > 0 && (
            <>
              <div className="space-y-2">
                <Label>Compte destination</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger><SelectValue placeholder="Choisis un compte" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aperçu ({preview.length} transactions)</Label>
                <div className="rounded-lg border overflow-auto max-h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Libellé</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.slice(0, 20).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{row.date}</TableCell>
                          <TableCell className="text-sm truncate max-w-[180px]">{row.label}</TableCell>
                          <TableCell className={`text-right font-medium text-sm ${row.amount >= 0 ? 'text-primary' : 'text-foreground'}`}>
                            {row.amount >= 0 ? '+' : ''}{formatCurrency(row.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {preview.length > 20 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-xs text-muted-foreground">
                            ... et {preview.length - 20} autres transactions
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {!imported && (
                <Button
                  onClick={handleImport}
                  disabled={!selectedAccount || importing}
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                >
                  {importing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Importation...</>
                    : <><Check className="w-4 h-4" /> Importer {preview.length} transactions</>}
                </Button>
              )}

              {imported && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg"
                >
                  <Check className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-primary">
                    {preview.length} transactions importées avec succès !
                  </p>
                </motion.div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}