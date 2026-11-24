import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { TRAINERS } from '../data/gymData';
import { SectionKicker } from './SectionKicker';
import { ResilientImage } from './ResilientImage';

interface TrainersSectionProps {
  onBookConsultation: () => void;
}

export const TrainersSection = memo(function TrainersSection({
  onBookConsultation,
}: TrainersSectionProps) {
  return (
    <section
      id="trainers"
      aria-labelledby="trainers-heading"
      className="section-contain border-t border-white/[0.07] bg-[#080808] py-16 sm:py-22 lg:py-32 scroll-mt-[64px] sm:scroll-mt-[72px]"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 lg:gap-6 mb-10 lg:mb-14">
          <div data-anim="trainers-header">
            <SectionKicker label="TRAINERS" />
            <h2
              id="trainers-heading"
              className="mt-5 sm:mt-6 font-display uppercase leading-[0.94] tracking-[0.015em] text-[clamp(2.2rem,4.6vw,4.1rem)]"
            >
              <span className="block text-white">COACHED BY</span>
              <span className="block text-[#7A7A7A]">COMPETITORS.</span>
            </h2>
          </div>

          <button
            type="button"
            data-anim="trainers-header"
            onClick={onBookConsultation}
            className="group/cta inline-flex items-center gap-3 self-start md:self-auto pb-1.5 border-b border-white/25 hover:border-[#FF4D1C] font-mono text-[10.5px] uppercase tracking-[0.18em] text-neutral-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:text-[#FF4D1C]"
          >
            <span>BOOK A CONSULTATION</span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover/cta:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* 3-Column Trainer Portrait Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 lg:gap-6">
          {TRAINERS.map((trainer) => (
            <article
              key={trainer.id}
              data-anim="trainer-card"
              data-testid={`trainer-card-${trainer.id}`}
              className="group relative aspect-[4/5] sm:aspect-[3/4] md:aspect-auto md:min-h-[400px] lg:min-h-0 lg:aspect-[3/4] overflow-hidden border border-white/[0.08] hover:border-white/[0.22] bg-[#0E0E0E] transition-all duration-300 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              <ResilientImage
                src={trainer.image}
                alt={trainer.imageAlt}
                className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
              />

              {/* Subtle Bottom Contrast Scrim for Name, Role & Short Bio */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-48 lg:h-60 bg-gradient-to-t from-[#080808] via-[#080808]/85 to-transparent"
              />

              {/* Top-Right Credential Tag */}
              <span className="absolute top-4 right-4 lg:top-5 lg:right-5 border border-white/15 group-hover:border-[#FF4D1C]/50 bg-black/75 px-2.5 py-1 font-mono text-[9.5px] lg:text-[10px] uppercase tracking-[0.14em] lg:tracking-[0.16em] text-neutral-300 group-hover:text-white transition-colors duration-300 tabular-nums whitespace-nowrap">
                {trainer.credential}
              </span>

              {/* Bottom Name, Specialization & Short Description */}
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-4 lg:p-6 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0">
                <h3 className="font-display text-[23px] md:text-[20px] lg:text-[26px] uppercase leading-none tracking-[0.03em] text-white">
                  {trainer.name}
                </h3>
                <p className="mt-1.5 lg:mt-2 font-mono text-[9.5px] lg:text-[10px] uppercase tracking-[0.16em] lg:tracking-[0.18em] text-[#FF4D1C]/90">
                  {trainer.role}
                </p>
                <p className="mt-2 lg:mt-2.5 text-[12.5px] md:text-[12px] lg:text-[13px] leading-[1.5] lg:leading-[1.55] text-neutral-300/90 max-w-[34ch]">
                  {trainer.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
