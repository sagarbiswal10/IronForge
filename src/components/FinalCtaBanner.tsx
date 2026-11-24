import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { FINAL_CTA_IMAGE } from '../data/gymData';
import { ResilientImage } from './ResilientImage';

interface FinalCtaBannerProps {
  onJoinGym: () => void;
  onBookTour: () => void;
}

export const FinalCtaBanner = memo(function FinalCtaBanner({
  onJoinGym,
  onBookTour,
}: FinalCtaBannerProps) {
  return (
    <section
      aria-labelledby="final-cta-heading"
      data-anim="final-cta-section"
      className="section-contain relative overflow-hidden border-t border-white/[0.07] bg-[#080808] py-16 sm:py-24 lg:py-36"
    >
      {/* Full-bleed atmospheric background photograph */}
      <div className="absolute inset-0">
        <ResilientImage
          src={FINAL_CTA_IMAGE}
          alt="Silhouetted powerlifter standing in a spotlighted iron gym holding a loaded Olympic barbell"
          className="w-full h-full object-cover object-center opacity-55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#080808]/45 to-[#080808]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(8,8,8,0.85)_100%)]"
        />
      </div>

      {/* Centered Editorial Statement */}
      <div className="relative z-10 max-w-[960px] mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        <p
          data-anim="final-cta-item"
          className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] sm:tracking-[0.24em] text-neutral-300"
        >
          FIRST WEEK FREE &nbsp;·&nbsp; LIMITED SPOTS
        </p>

        <h2
          id="final-cta-heading"
          data-anim="final-cta-item"
          className="mt-5 sm:mt-6 font-display uppercase leading-[0.9] tracking-[0.015em] text-[clamp(2.75rem,8vw,6.8rem)]"
        >
          <span className="block text-white">NO SHORTCUTS.</span>
          <span className="block text-stroke-iron">ONLY IRON.</span>
        </h2>

        <div
          data-anim="final-cta-item"
          className="mt-8 sm:mt-10 w-full max-w-sm sm:max-w-none sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4"
        >
          <button
            type="button"
            onClick={onJoinGym}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-[#FF4D1C] hover:bg-[#E53E10] text-white px-6 sm:px-7 py-3.5 sm:py-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] sm:tracking-[0.18em] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>JOIN THE GYM</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onBookTour}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 border border-white/25 hover:border-white bg-black/55 text-white px-6 sm:px-7 py-3.5 sm:py-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] sm:tracking-[0.18em] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C]"
          >
            <span>BOOK A FREE GYM TOUR</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
});
