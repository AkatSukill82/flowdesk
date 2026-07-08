import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileArchive, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '';

export default function ExportButtons({ statement, items }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  const handlePDF = () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Relevé de paiements', 14, 20);
      doc.setFontSize(10);
      doc.text(`Période : ${formatDate(statement.period_start)} — ${formatDate(statement.period_end)}`, 14, 28);
      doc.text(`Généré le : ${formatDate(statement.generated_at)}`, 14, 34);

      let y = 44;
      doc.setFontSize(9);
      doc.text('Date', 14, y);
      doc.text('Marchand', 45, y);
      doc.text('Montant', 120, y);
      doc.text('Devise', 150, y);
      doc.text('Catégorie', 165, y);
      doc.text('Vérifié', 200, y);
      y += 4;
      doc.line(14, y, 210, y);
      y += 6;

      doc.setFontSize(8);
      items.forEach((item) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(formatDate(item.date), 14, y);
        doc.text((item.vendor || '').substring(0, 30), 45, y);
        doc.text(item.amount?.toFixed(2) || '', 120, y);
        doc.text(item.currency || 'EUR', 150, y);
        doc.text((item.category || '').substring(0, 18), 165, y);
        doc.text(item.verified ? 'Oui' : 'Non', 200, y);
        y += 6;
      });

      if (y > 270) { doc.addPage(); y = 20; }
      y += 4;
      doc.line(14, y, 210, y);
      y += 6;
      const totals = statement.totals_by_currency || {};
      Object.entries(totals).forEach(([curr, amt]) => {
        doc.text(`Total ${curr}: ${amt.toFixed(2)}`, 120, y);
        y += 6;
      });

      doc.save(`releve_${statement.period_start}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleZIP = async () => {
    setZipLoading(true);
    try {
      const attachments = items.filter(i => i.attachment);
      if (attachments.length === 0) {
        alert('Aucune pièce jointe à télécharger');
        return;
      }
      const zip = new JSZip();
      for (const item of attachments) {
        const res = await fetch(item.attachment);
        const blob = await res.blob();
        const ext = item.attachment.split('.').pop()?.split('?')[0] || 'pdf';
        const safeName = (item.vendor || 'sans-nom').replace(/[^a-zA-Z0-9]/g, '_');
        zip.file(`${safeName}_${item.date}.${ext}`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pieces_jointes_${statement.period_start}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button onClick={handlePDF} disabled={pdfLoading} variant="outline" className="gap-2">
        {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Télécharger le PDF
      </Button>
      <Button onClick={handleZIP} disabled={zipLoading} variant="outline" className="gap-2">
        {zipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
        Pièces jointes (.zip)
      </Button>
    </div>
  );
}