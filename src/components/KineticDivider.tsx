import { memo, type CSSProperties } from 'react';

export type KineticDividerVariant =
  | 'marquee-left'
  | 'sheen-marquee'
  | 'dual-opposing'
  | 'scroll-scrub'
  | 'angled-cross'
  | 'scroll-scrub-reverse';

interface KineticDividerProps {
  id: string;
  variant: KineticDividerVariant;
  items: readonly string[];
  secondaryItems?: readonly string[];
  durationSec?: number;
}

function StarburstIcon({
  className = 'w-3.5 h-3.5 sm:w-4 sm:h-4',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d="M12 0.8L14.45 7.55L20.5 3.5L16.45 9.55L23.2 12L16.45 14.45L20.5 20.5L14.45 16.45L12 23.2L9.55 16.45L3.5 20.5L7.55 14.45L0.8 12L7.55 9.55L3.5 3.5L9.55 7.55L12 0.8Z" />
    </svg>
  );
}

function RibbonSequence({
  items,
  starClassName,
  starAnimAttr,
  textClassName,
  duplicate = false,
}: {
  items: readonly string[];
  starClassName?: string;
  starAnimAttr?: string;
  textClassName?: string;
  duplicate?: boolean;
}) {
  return (
    <div
      aria-hidden={duplicate || undefined}
      className="flex shrink-0 items-center gap-6 sm:gap-8 lg:gap-10 pr-6 sm:pr-8 lg:pr-10"
    >
      {items.map((label, idx) => (
        <div
          key={`${duplicate ? 'dup' : 'main'}-${idx}-${label}`}
          className="inline-flex items-center gap-6 sm:gap-8 lg:gap-10 whitespace-nowrap"
        >
          <span
            className={
              textClassName ??
              'font-sans font-bold uppercase text-[12.5px] sm:text-[14px] lg:text-[15px] tracking-[0.11em] text-[#080808] leading-none'
            }
          >
            {label}
          </span>
          <span
            data-anim={starAnimAttr}
            className={`inline-flex items-center justify-center ${starClassName ?? ''}`}
          >
            <StarburstIcon />
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Full-bleed forge-orange kinetic divider ribbons placed cleanly in inter-section gaps.
 * Uses GPU-composited transforms only (zero layout reflow) and disables motion cleanly
 * under prefers-reduced-motion.
 */
export const KineticDivider = memo(function KineticDivider({
  id,
  variant,
  items,
  secondaryItems,
  durationSec = 28,
}: KineticDividerProps) {
  const durationStyle = {
    '--marquee-duration': `${durationSec}s`,
  } as CSSProperties;

  if (variant === 'dual-opposing') {
    const subItems = secondaryItems && secondaryItems.length > 0 ? secondaryItems : items;
    const subStyle = {
      '--marquee-duration': `${Math.round(durationSec * 1.15)}s`,
    } as CSSProperties;

    return (
      <div
        data-testid={`kinetic-divider-${id}`}
        data-variant={variant}
        aria-hidden="true"
        className="section-contain relative w-full max-w-full overflow-hidden select-none border-y border-white/[0.08] bg-[#080808]"
      >
        {/* Main Bold Forge-Orange Ribbon scrolling right */}
        <div className="kinetic-ribbon-hover relative w-full overflow-hidden bg-[#FF4D1C] text-[#080808] py-3 sm:py-3.5 border-b border-black/25">
          <div className="flex w-max animate-kinetic-right" style={durationStyle}>
            <RibbonSequence
              items={items}
              starClassName="animate-kinetic-star-spin text-[#080808]"
            />
            <RibbonSequence
              items={items}
              starClassName="animate-kinetic-star-spin text-[#080808]"
              duplicate
            />
          </div>
        </div>

        {/* Sleek Counter-Scrolling Obsidian/Orange Sub-Track scrolling left */}
        <div className="kinetic-ribbon-hover relative w-full overflow-hidden bg-[#0E0E0E] text-[#FF4D1C] py-2 sm:py-2.5">
          <div className="flex w-max animate-kinetic-left" style={subStyle}>
            <RibbonSequence
              items={subItems}
              textClassName="font-mono font-medium uppercase text-[10px] sm:text-[11px] tracking-[0.2em] text-[#FF4D1C]/90 leading-none"
              starClassName="animate-kinetic-star-spin-reverse text-[#FF4D1C]/75 scale-75"
            />
            <RibbonSequence
              items={subItems}
              textClassName="font-mono font-medium uppercase text-[10px] sm:text-[11px] tracking-[0.2em] text-[#FF4D1C]/90 leading-none"
              starClassName="animate-kinetic-star-spin-reverse text-[#FF4D1C]/75 scale-75"
              duplicate
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'scroll-scrub' || variant === 'scroll-scrub-reverse') {
    const direction = variant === 'scroll-scrub-reverse' ? 'reverse' : 'forward';
    return (
      <div
        data-testid={`kinetic-divider-${id}`}
        data-variant={variant}
        data-anim="kinetic-scrub-container"
        data-scrub-dir={direction}
        aria-hidden="true"
        className="section-contain relative w-full max-w-full overflow-hidden select-none bg-[#FF4D1C] text-[#080808] py-3 sm:py-3.5 border-y border-black/20"
      >
        {variant === 'scroll-scrub-reverse' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-kinetic-sheen"
          />
        )}
        <div
          data-anim="kinetic-scrub-track"
          className="flex w-max -ml-[18%]"
        >
          <RibbonSequence
            items={items}
            starAnimAttr="kinetic-scrub-star"
            starClassName="text-[#080808]"
          />
          <RibbonSequence
            items={items}
            starAnimAttr="kinetic-scrub-star"
            starClassName="text-[#080808]"
            duplicate
          />
          <RibbonSequence
            items={items}
            starAnimAttr="kinetic-scrub-star"
            starClassName="text-[#080808]"
            duplicate
          />
        </div>
      </div>
    );
  }

  if (variant === 'angled-cross') {
    const backItems = secondaryItems && secondaryItems.length > 0 ? secondaryItems : items;
    const backStyle = {
      '--marquee-duration': `${Math.round(durationSec * 1.25)}s`,
    } as CSSProperties;

    return (
      <div
        data-testid={`kinetic-divider-${id}`}
        data-variant={variant}
        aria-hidden="true"
        className="section-contain relative w-full max-w-full overflow-hidden select-none bg-[#080808] py-5 sm:py-6"
      >
        {/* Subtle Angled Back Track (Charcoal + Forge Orange) */}
        <div className="relative -mx-4 rotate-[1.15deg] bg-[#141414] border-y border-white/[0.08] py-2 sm:py-2.5 opacity-90">
          <div className="flex w-max animate-kinetic-right" style={backStyle}>
            <RibbonSequence
              items={backItems}
              textClassName="font-mono font-medium uppercase text-[10.5px] sm:text-[11.5px] tracking-[0.2em] text-neutral-400 leading-none"
              starClassName="text-[#FF4D1C] scale-75"
            />
            <RibbonSequence
              items={backItems}
              textClassName="font-mono font-medium uppercase text-[10.5px] sm:text-[11.5px] tracking-[0.2em] text-neutral-400 leading-none"
              starClassName="text-[#FF4D1C] scale-75"
              duplicate
            />
          </div>
        </div>

        {/* Dominant Counter-Angled Solid Forge-Orange Ribbon */}
        <div className="kinetic-ribbon-hover relative -mx-4 -mt-5 sm:-mt-6 -rotate-[1.15deg] bg-[#FF4D1C] text-[#080808] py-3 sm:py-3.5 border-y border-black/25 shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
          <div className="flex w-max animate-kinetic-left" style={durationStyle}>
            <RibbonSequence
              items={items}
              starClassName="animate-kinetic-star-pulse text-[#080808]"
            />
            <RibbonSequence
              items={items}
              starClassName="animate-kinetic-star-pulse text-[#080808]"
              duplicate
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sheen-marquee') {
    return (
      <div
        data-testid={`kinetic-divider-${id}`}
        data-variant={variant}
        aria-hidden="true"
        className="section-contain kinetic-ribbon-hover relative w-full max-w-full overflow-hidden select-none bg-[#FF4D1C] text-[#080808] py-3 sm:py-3.5 border-y border-black/20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-kinetic-sheen"
        />
        <div className="relative flex w-max animate-kinetic-right" style={durationStyle}>
          <RibbonSequence
            items={items}
            starClassName="animate-kinetic-star-pulse text-[#080808]"
          />
          <RibbonSequence
            items={items}
            starClassName="animate-kinetic-star-pulse text-[#080808]"
            duplicate
          />
        </div>
      </div>
    );
  }

  // Default: 'marquee-left'
  return (
    <div
      data-testid={`kinetic-divider-${id}`}
      data-variant={variant}
      aria-hidden="true"
      className="section-contain kinetic-ribbon-hover relative w-full max-w-full overflow-hidden select-none bg-[#FF4D1C] text-[#080808] py-3 sm:py-3.5 border-y border-black/20"
    >
      <div className="flex w-max animate-kinetic-left" style={durationStyle}>
        <RibbonSequence
          items={items}
          starClassName="animate-kinetic-star-spin text-[#080808]"
        />
        <RibbonSequence
          items={items}
          starClassName="animate-kinetic-star-spin text-[#080808]"
          duplicate
        />
      </div>
    </div>
  );
});
