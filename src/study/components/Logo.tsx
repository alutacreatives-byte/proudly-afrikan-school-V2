import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showStudyBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  showStudyBadge = false,
  className = '',
  onClick,
}) => {
  const isClickable = Boolean(onClick);
  const [imgError, setImgError] = React.useState(false);

  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl lg:text-5xl',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] sm:text-xs px-2 py-0.5',
    lg: 'text-xs sm:text-sm px-2.5 py-1',
    xl: 'text-sm sm:text-base px-3.5 py-1.5',
  };

  return (
    <div
      id="brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Proudly Afrikan Official Emblem Box */}
      <div
        className={`${emblemSizes[size]} relative flex-shrink-0 bg-[#161616] rounded-md p-0.5 border-2 border-[#161616] shadow-[2px_2px_0px_#D92B8A] group-hover:shadow-[3px_3px_0px_#D92B8A] transition-all overflow-hidden flex items-center justify-center`}
      >
        {!imgError ? (
          <img
            src="https://sifisos.com/wp-content/uploads/2026/04/Proudly-Afrikan-Logo.png"
            alt="Proudly Afrikan"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-display font-black text-xs text-[#D92B8A] tracking-tighter">
            PA
          </span>
        )}
      </div>

      {/* Typography Block */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`font-display font-black tracking-tight text-[#161616] uppercase leading-none ${titleSizes[size]}`}
          >
            PROUDLY AFRIKAN
          </span>
          {showStudyBadge && (
            <span
              className={`font-display font-black tracking-wider text-white bg-[#D92B8A] border-[1.5px] border-[#161616] rounded shadow-[1.5px_1.5px_0px_#161616] uppercase ${badgeSizes[size]}`}
            >
              STUDY
            </span>
          )}
        </div>
        {showTagline && (
          <span className="font-mono text-[11px] sm:text-xs text-[#6B6862] font-semibold tracking-wide mt-0.5">
            Learn it. Remember it. Own it.
          </span>
        )}
      </div>
    </div>
  );
};
