import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="border-t border-border py-10 px-4 bg-card/40">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-primary-foreground font-bold text-xs">F</span>
            </div>
            <span className="font-bold">FlowDesk</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Données chiffrées · Hébergées en UE · Conforme RGPD</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FlowDesk · <Link to="/login" className="hover:text-foreground">Connexion</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}