import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

export interface GlobalNavigationButtonsProps {
  onBack?: () => void;
  onGoHome?: () => void;
  className?: string;
  backLabel?: string;
  homeLabel?: string;
}

export const GlobalNavigationButtons: React.FC<GlobalNavigationButtonsProps> = ({
  onBack,
  onGoHome,
  className = '',
  backLabel = 'BACK',
  homeLabel = 'HOME',
}) => {
  const handleHome = () => {
    if (onGoHome) {
      onGoHome();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        id="global-nav-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold text-stone-800 hover:text-black uppercase tracking-wider transition-all px-3.5 py-2 bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-50 rounded-full shadow-xs cursor-pointer active:scale-95 shrink-0"
        title="Return to previous page"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{backLabel}</span>
      </button>

      <button
        type="button"
        id="global-nav-home-btn"
        onClick={handleHome}
        className="inline-flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold text-stone-800 hover:text-black uppercase tracking-wider transition-all px-3.5 py-2 bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-50 rounded-full shadow-xs cursor-pointer active:scale-95 shrink-0"
        title="Return to home"
      >
        <Home className="w-4 h-4" />
        <span>{homeLabel}</span>
      </button>
    </div>
  );
};
