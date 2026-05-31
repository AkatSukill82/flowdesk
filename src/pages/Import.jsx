import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, FileText, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SheetsImport from '@/components/import/SheetsImport';

export default function Import() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [parseError, setParseError] = useState('');
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
    initialData: [],
  });

  const parseCSV = useCallback((text) => {
    setParseError('');
    const separator = text.includes(';') ? ';' : ',';
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setParseError('Le fichier semble vide ou ne contient qu\'une seule ligne.');
      return [];
    }

    const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(separator).map((c) => c.trim().replace(/"/g, ''));
      if (cols.length < 2) continue;

      // Try to find date, label, amount columns
      const dateIdx = headers.findIndex((h) =>
        h.includes('date') || h.includes('datum') || h.includes('valeur')
      );
      const labelIdx = headers.findIndex((h) =>
        h.includes('label') || h.includes('libellé') || h.includes('libelle') || h.includes('description') || h.includes('communication') || h.includes('omschrijving')
      );
      const amountIdx = headers.findIndex((h) =>
        h.includes('amount') || h.includes('montant') || h.includes('bedrag') || h.includes('total')
      );
      const debitIdx = headers.findIndex((h) => h.includes('debit') || h.includes('débit'));
      const creditIdx = headers.findIndex((h) => h.includes('credit') || h.includes('crédit'));

      let amount = 0;
      if (amountIdx >= 0) {
        amount = parseFloat(cols[amountIdx]?.replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
      } else if (debitIdx >= 0 && creditIdx >= 0) {
        const debit = parseFloat(cols[debitIdx]?.replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
        const credit = parseFloat(cols[creditIdx]?.replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
        amount = credit > 0 ? credit : -debit;
      }

      const dateStr = dateIdx >= 0 ? cols[dateIdx] : '';
      let parsedDate = '';
      if (dateStr) {
        // Handle DD/MM/YYYY or DD-MM-YYYY
        const parts = dateStr.split(/[/.-]/);
        if (parts.length === 3) {
          const [a, b, c] = parts;
          if (a.length === 4) {
            parsedDate = `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
          } else {
            parsedDate = `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
          }
        }
      }

      rows.push({
        date: parsedDate || new Date().toISOString().split('T')[0],
        label: labelIdx >= 0 ? cols[labelIdx] : cols[1] || 'Transaction importée',
        amount,
        category: amount >= 0 ? 'income' : 'expense',
        source: 'csv_import',
      });
    }

    if (rows.length === 0) {
      setParseError('Aucune transaction n\'a pu être lue. Vérifie le format du fichier.');
    }
    return rows;
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImported(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      const rows = parseCSV(text);
      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!selectedAccount || preview.length === 0) return;
    setImporting(true);

    const data = preview.map((row) => ({
      ...row,
      account_id: selectedAccount,
    }));

    await base44.entities.Transaction.bulkCreate(data);
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    setImporting(false);
    setImported(true);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importer des transactions</h1>
        <p className="text-sm text-muted-foreground">
          Importe un fichier CSV de ta banque pour ajouter tes transactions automatiquement
        </p>
      </div>

      <Tabs defaultValue="csv">
        <TabsList className="w-full">
          <TabsTrigger value="csv" className="flex-1">📄 Fichier CSV</TabsTrigger>
          <TabsTrigger value="sheets" className="flex-1">🟢 Google Sheets</TabsTrigger>
        </TabsList>

        <TabsContent value="sheets">
          <Card>
            <CardContent className="p-6">
              <SheetsImport accounts={accounts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* File Upload */}
          <div className="space-y-3">
            <Label>Fichier CSV</Label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{preview.length} transactions détectées</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique ou glisse un fichier CSV ici</p>
                  <p className="text-xs text-muted-foreground mt-1">Formats supportés : CSV (séparateur virgule ou point-virgule)</p>
                </>
              )}
            </label>
          </div>

          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              {parseError}
            </div>
          )}

          {/* Account Selection */}
          {preview.length > 0 && (
            <div className="space-y-3">
              <Label>Compte destination</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisis un compte" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview Table */}
          {preview.length > 0 && (
            <div className="space-y-3">
              <Label>Aperçu ({preview.length} transactions)</Label>
              <div className="rounded-lg border overflow-auto max-h-[400px]">
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
                        <TableCell className="text-sm truncate max-w-[200px]">{row.label}</TableCell>
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
          )}

          {/* Import Button */}
          {preview.length > 0 && !imported && (
            <Button
              onClick={handleImport}
              disabled={!selectedAccount || importing}
              className="w-full bg-primary hover:bg-primary/90 gap-2"
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Importation en cours...</>
              ) : (
                <><Upload className="w-4 h-4" /> Importer {preview.length} transactions</>
              )}
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
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}