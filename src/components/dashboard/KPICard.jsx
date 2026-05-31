import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function KPICard({ title, value, icon: Icon, trend, trendLabel, variant = 'default' }) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'bg-primary/5 border-primary/20',
    accent: 'bg-accent/10 border-accent/30',
    danger: 'bg-destructive/5 border-destructive/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-5 ${variantStyles[variant]} border transition-shadow hover:shadow-md`}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          {Icon && (
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${trend >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
          </div>
        )}
      </Card>
    </motion.div>
  );
}