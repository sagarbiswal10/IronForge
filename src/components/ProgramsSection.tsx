import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { PROGRAMS } from '../data/gymData';
import { SectionKicker } from './SectionKicker';
import { ResilientImage } from './ResilientImage';

interface ProgramsSectionProps {
  onSelectProgram: (goalValue: string) => void;
}

export const ProgramsSection = memo(function ProgramsSection({
  onSelectProgram,
}: ProgramsSectionProps) {
  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="section-contain border-t border-white/[0.07] bg-[#080808] py-16 sm:py-22 lg:py-32 scroll-mt-[64px] sm:scroll-mt-[72px]"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header Row */}
        <div className="mb-10 lg:mb-14">
          <div data-anim="programs-header">
            <SectionKicker label="TRAINING PROGRAMS" />
            <h2
              id="programs-heading"
              className="mt-5 sm:mt-6 font-display uppercase leading-[0.94] tracking-[0.015em] text-[clamp(2.2rem,4.6vw,4.1rem)]"
            >
              <span className="block text-white">THREE DISCIPLINES.</span>
              <span className="block text-[#7A7A7A]">ONE STANDARD.</span>
            </h2>
          </div>
        </div>

        {/* 3-Column Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 lg:gap-6">
          {PROGRAMS.map((program) => (
            <article
              key={program.id}
              data-anim="program-card"
              className="group relative flex flex-col justify-between min-h-[390px] sm:min-h-[440px] md:min-h-[430px] lg:min-h-[520px] overflow-hidden border border-white/[0.08] hover:border-white/25 bg-[#111111] transition-colors duration-200"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <ResilientImage
                  src={program.image}
                  alt={program.imageAlt}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                {/* Measured Scrim for 4.5:1 text legibility */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/65 to-[#080808]/25"
                />
              </div>

              {/* Top Meta Row */}
              <div className="relative z-10 p-5 md:p-4 lg:p-6 flex items-center justify-end gap-3">
                <span className="border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[9.5px] lg:text-[10px] uppercase tracking-[0.14em] lg:tracking-[0.16em] text-neutral-300 tabular-nums whitespace-nowrap">
                  {program.duration}
                </span>
              </div>

              {/* Bottom Content & Action */}
              <div className="relative z-10 p-5 md:p-4 lg:p-6 pt-12 lg:pt-16 mt-auto">
                <h3 className="font-display text-[28px] md:text-[24px] lg:text-[34px] uppercase leading-[0.95] tracking-[0.02em] text-white">
                  {program.title}
                </h3>
                <p className="mt-2.5 lg:mt-3 text-[13px] lg:text-[13.5px] leading-relaxed text-neutral-300 max-w-[30ch]">
                  {program.description}
                </p>

                <div className="mt-5 lg:mt-6 pt-3.5 lg:pt-4 border-t border-white/[0.12] flex items-center justify-between gap-2.5">
                  <span className="font-mono text-[9.5px] lg:text-[10px] uppercase tracking-[0.13em] lg:tracking-[0.16em] text-neutral-400">
                    {program.schedule}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectProgram(program.goalValue)}
                    aria-label={`Inquire about ${program.title}`}
                    className="w-9 h-9 border border-white/20 group-hover:border-[#FF4D1C] group-hover:bg-[#FF4D1C] text-white flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C]"
                  >
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
