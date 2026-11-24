import { memo, type MouseEvent } from 'react';

interface BrandLogoProps {
  showSubtext?: boolean;
  onNavigateHome?: () => void;
}

export const BrandLogo = memo(function BrandLogo({
  showSubtext = false,
  onNavigateHome,
}: BrandLogoProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (onNavigateHome) {
      event.preventDefault();
      onNavigateHome();
    }
  };

  return (
    <a
      href="#home"
      onClick={handleClick}
      className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
      aria-label="IRONFORGE FITNESS home"
    >
      <span
        className="w-5 h-5 bg-[#FF4D1C] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="1" y="3" width="2" height="6" fill="#080808" />
          <rect x="9" y="3" width="2" height="6" fill="#080808" />
          <rect x="3" y="5" width="6" height="2" fill="#080808" />
        </svg>
      </span>
      <span className="font-display text-[17px] tracking-[0.06em] text-white uppercase leading-none">
        IRONFORGE
      </span>
      {showSubtext && (
        <span className="font-mono text-[9px] tracking-[0.22em] text-neutral-500 uppercase leading-none">
          FITNESS
        </span>
      )}
    </a>
  );
});
