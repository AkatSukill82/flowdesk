import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function AlertBanner({ alert }) {
  const [dismissed, setDismissed] = useState(false);
  const queryClient = useQueryClient();

  if (!alert || dismissed) return null;

  const handleDismiss = async () => {
    await base44.entities.Alert.update(alert.id, { is_read: true });
    setDismissed(true);
    queryClient.invalidateQueries({ queryKey: ['unread-alerts-count'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-accent/15 border border-accent/30 rounded-xl p-4 flex items-start gap-3"
      >
        <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm font-medium text-foreground">{alert.message}</p>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}