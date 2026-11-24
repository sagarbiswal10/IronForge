import { Suspense, lazy, memo, type MouseEvent } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { HERO_METRICS } from '../data/gymData';
import { SectionKicker } from './SectionKicker';

const HeroBarbellCanvas = lazy(() => import('./three/HeroBarbellCanvas'));

interface HeroSectionProps {
  onJoinGym: () => void;
  onExplorePrograms: () => void;
  onScrollToAbout?: () => void;
  heroScrollProgressRef: React.MutableRefObject<number>;
}

function HeroCanvasPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full h-[230px] sm:h-[310px] lg:h-[380px] flex items-center justify-center"
    >
      <div className="w-[72%] h-[42%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,77,28,0.14)_0%,rgba(255,255,255,0.03)_48%,transparent_75%)]" />
    </div>
  );
}

export const HeroSection = memo(function HeroSection({
  onJoinGym,
  onExplorePrograms,
  onScrollToAbout,
  heroScrollProgressRef,
}: HeroSectionProps) {
  const handleScrollExploreClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (onScrollToAbout) {
      event.preventDefault();
      onScrollToAbout();
    }
  };

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      data-scroll-progress="0.00"
      className="relative overflow-hidden bg-[#080808] hero-grid-bg"
    >
      {/* Subtle warm forge ambient glow behind the right barbell stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[60%] h-[82%] bg-[radial-gradient(ellipse_at_68%_42%,rgba(255,77,28,0.16),rgba(160,42,10,0.06)_42%,transparent_72%)]"
      />

      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 pt-7 sm:pt-11 lg:pt-14 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-9 lg:gap-8 items-center lg:min-h-[540px]">
          {/* Left Typography & CTAs */}
          <div className="lg:col-span-6 min-w-0 flex flex-col items-start">
            <div data-anim="hero-text">
              <SectionKicker label="PRIVATE STRENGTH CLUB — EST. 2012" />
            </div>

            <h1
              id="hero-heading"
              data-anim="hero-text"
              className="mt-5 sm:mt-6 font-display uppercase leading-[0.9] tracking-[0.015em] text-[clamp(3.1rem,7vw,6.4rem)] text-white"
            >
              <span className="block">BUILD YOUR</span>
              <span className="block text-stroke-iron">STRONGEST</span>
              <span className="block">
                VERSION<span className="text-[#FF4D1C]">.</span>
              </span>
            </h1>

            <p
              data-anim="hero-text"
              className="mt-4 sm:mt-5 text-[14.5px] sm:text-base leading-relaxed text-neutral-400 max-w-sm"
            >
              Train harder. Move stronger.
              <br />
              Become unstoppable.
            </p>

            <div
              data-anim="hero-cta"
              className="mt-6 sm:mt-8 w-full sm:w-auto flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5"
            >
              <button
                type="button"
                onClick={onJoinGym}
                className="w-full sm:w-auto inline-flex items-center justify-between gap-4 sm:gap-5 bg-[#FF4D1C] hover:bg-[#E53E10] text-white px-6 sm:px-7 py-3.5 sm:py-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
              >
                <span>JOIN THE GYM</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExplorePrograms}
                className="w-full sm:w-auto inline-flex items-center justify-between gap-4 sm:gap-5 border border-white/15 hover:border-white/40 bg-transparent text-white px-6 sm:px-7 py-3.5 sm:py-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C]"
              >
                <span>EXPLORE PROGRAMS</span>
                <ArrowDown className="w-3.5 h-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right Interactive 3D Olympic Barbell Stage (Code-split & streamed asynchronously) */}
          <div
            data-testid="hero-barbell-stage"
            className="lg:col-span-6 min-w-0 w-full relative flex flex-col justify-between min-h-[260px] sm:min-h-[360px] lg:min-h-[470px] py-1"
          >
            <div className="flex justify-end">
              <div className="text-right font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] leading-relaxed">
                <p className="text-neutral-500">DRAG TO ROTATE</p>
              </div>
            </div>

            <div className="relative my-1.5 sm:my-2 w-full min-w-0 overflow-hidden">
              <Suspense fallback={<HeroCanvasPlaceholder />}>
                <HeroBarbellCanvas scrollProgressRef={heroScrollProgressRef} />
              </Suspense>
            </div>

            <div className="flex flex-col items-start pl-0 lg:pl-8">
              <p className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-neutral-300">
                OLYMPIC BAR — 20 KG
              </p>
              <p className="mt-1 font-mono text-[9px] sm:text-[9.5px] uppercase tracking-[0.15em] sm:tracking-[0.18em] text-neutral-600 tabular-nums">
                Ø 28 MM · 2200 MM · 1500 LB RATED
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Hero Metrics Strip */}
        <div
          data-anim="hero-metrics"
          className="mt-6 sm:mt-8 lg:mt-10 border-t border-white/[0.08] py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6"
        >
          <dl className="grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-14 lg:gap-16">
            {HERO_METRICS.map((metric) => (
              <div key={metric.label} className="flex flex-col min-w-0">
                <dt className="order-2 mt-1 font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.14em] sm:tracking-[0.2em] text-neutral-500">
                  {metric.label}
                </dt>
                <dd className="order-1 font-display text-[22px] sm:text-[26px] leading-none text-white tabular-nums">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>

          <a
            href="#about"
            onClick={handleScrollExploreClick}
            className="inline-flex items-center gap-3 sm:gap-3.5 font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-neutral-500 hover:text-white transition-colors group self-start sm:self-auto whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:text-white"
          >
            <span>SCROLL TO EXPLORE</span>
            <span className="w-8 h-8 border border-white/15 group-hover:border-white/40 flex items-center justify-center transition-colors">
              <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
});
