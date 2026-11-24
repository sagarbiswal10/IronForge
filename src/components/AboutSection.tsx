import { memo } from 'react';
import { ABOUT_FLOOR_IMAGE, ABOUT_STATS } from '../data/gymData';
import { SectionKicker } from './SectionKicker';
import { ResilientImage } from './ResilientImage';

export const AboutSection = memo(function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="section-contain border-t border-white/[0.07] bg-[#080808] py-14 sm:py-20 lg:py-24 scroll-mt-[64px] sm:scroll-mt-[72px]"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 sm:gap-11 lg:gap-16 items-stretch">
          {/* Left Narrative & Stats */}
          <div className="lg:col-span-5 flex flex-col justify-between py-1 sm:py-2">
            <div data-anim="about-reveal">
              <SectionKicker label="ABOUT" />

              <h2
                id="about-heading"
                className="mt-5 sm:mt-6 font-display uppercase leading-[0.94] tracking-[0.015em] text-[clamp(2.25rem,4.4vw,3.9rem)] text-white"
              >
                <span className="block">FORGED FOR</span>
                <span className="block">THOSE WHO</span>
                <span className="block">TAKE THE WORK</span>
                <span className="block">SERIOUSLY.</span>
              </h2>

              <p className="mt-5 sm:mt-6 text-[14.5px] sm:text-[15px] leading-[1.7] text-neutral-400 max-w-md">
                A members-first strength club built on one belief: progress is
                earned under the bar. World-class equipment, elite coaching and a
                community that pushes you further.
              </p>
            </div>

            <dl
              data-anim="about-reveal"
              className="mt-9 sm:mt-11 lg:mt-12 pt-6 sm:pt-7 border-t border-white/[0.08] grid grid-cols-3 gap-4 sm:gap-6"
            >
              {ABOUT_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col min-w-0">
                  <dt className="order-2 mt-1.5 font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-neutral-500">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-display text-[26px] sm:text-[34px] leading-none text-white tabular-nums">
                    {stat.value}
                    {stat.accentSuffix && (
                      <span className="text-[#FF4D1C]">{stat.accentSuffix}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right Main Floor Architectural Photography */}
          <div data-anim="about-reveal" className="lg:col-span-7">
            <figure className="relative w-full h-[320px] sm:h-[400px] md:h-[450px] lg:h-[580px] overflow-hidden border border-white/[0.08] bg-[#111111]">
              <ResilientImage
                src={ABOUT_FLOOR_IMAGE}
                alt="The main lifting floor at Ironforge Fitness lined with matte black competition power racks"
                className="w-full h-full object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-32 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-neutral-400">
                <span className="truncate">THE MAIN FLOOR</span>
                <span className="tabular-nums text-neutral-500 whitespace-nowrap shrink-0">40.7128° N</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
});
