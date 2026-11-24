import { memo } from 'react';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { MEMBERSHIP_PLANS } from '../data/gymData';
import { SectionKicker } from './SectionKicker';

interface MembershipSectionProps {
  onSelectPlan: (goalValue: string) => void;
}

export const MembershipSection = memo(function MembershipSection({
  onSelectPlan,
}: MembershipSectionProps) {
  return (
    <section
      id="membership"
      aria-labelledby="membership-heading"
      className="section-contain border-t border-white/[0.07] bg-[#080808] py-16 sm:py-22 lg:py-32 scroll-mt-[64px] sm:scroll-mt-[72px]"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 lg:gap-6 mb-10 lg:mb-14">
          <div data-anim="membership-header">
            <SectionKicker label="MEMBERSHIP" />
            <h2
              id="membership-heading"
              className="mt-5 sm:mt-6 font-display uppercase leading-[0.94] tracking-[0.015em] text-[clamp(2.2rem,4.6vw,4.1rem)] text-white"
            >
              CHOOSE YOUR LEVEL.
            </h2>
          </div>

          <p
            data-anim="membership-header"
            className="text-sm sm:text-[15px] leading-relaxed text-neutral-400 max-w-xs lg:pb-1"
          >
            No joining fees. No lock-in contracts. Upgrade or cancel anytime.
          </p>
        </div>

        {/* 3-Column Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 lg:gap-6 items-stretch">
          {MEMBERSHIP_PLANS.map((plan) => (
            <article
              key={plan.id}
              data-anim="membership-card"
              data-testid={`membership-card-${plan.id}`}
              className={`group relative flex flex-col justify-between p-6 sm:p-7 md:p-5 lg:p-8 xl:p-9 border transition-all duration-300 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0 ${
                plan.featured
                  ? 'bg-[#141414] border-white/[0.15] border-t-2 border-t-[#FF4D1C] hover:border-[#FF4D1C]/50 hover:shadow-[0_20px_48px_-28px_rgba(255,77,28,0.45)]'
                  : 'bg-[#0E0E0E] border-white/[0.08] hover:border-white/[0.22] hover:bg-[#111111]'
              }`}
            >
              {plan.featured && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_85%_60%_at_50%_0%,rgba(255,77,28,0.12)_0%,transparent_75%)] opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}

              <div className="relative">
                {/* Card Top Meta */}
                <div className="flex items-center justify-start gap-3 font-mono text-[9.5px] lg:text-[10px] uppercase tracking-[0.16em] lg:tracking-[0.18em]">
                  <span
                    className={
                      plan.featured
                        ? 'text-[#FF4D1C] font-medium whitespace-nowrap'
                        : 'text-neutral-500 group-hover:text-neutral-400 transition-colors whitespace-nowrap'
                    }
                  >
                    {plan.badge}
                  </span>
                </div>

                {/* Tier Title & Subtitle */}
                <h3 className="mt-6 lg:mt-8 font-display text-[26px] md:text-[24px] lg:text-[28px] uppercase leading-none tracking-[0.03em] text-white">
                  {plan.name}
                </h3>
                <p className="mt-2 text-[13px] lg:text-[13.5px] text-neutral-400">{plan.subtitle}</p>

                {/* Price */}
                <div className="mt-6 lg:mt-8 flex items-baseline gap-1.5 flex-wrap">
                  <span className="inline-flex items-baseline gap-0.5 lg:gap-1 tabular-nums">
                    <span
                      aria-hidden="true"
                      className="font-sans text-[24px] md:text-[22px] lg:text-[29px] xl:text-[31px] font-medium leading-none text-neutral-300 -translate-y-0.5"
                    >
                      ₹
                    </span>
                    <span className="font-display text-[44px] md:text-[36px] lg:text-[48px] xl:text-[54px] leading-none text-white">
                      {plan.priceDisplay}
                    </span>
                  </span>
                  <span className="sr-only">₹{plan.priceDisplay}</span>
                  <span className="font-mono text-[10px] lg:text-[11px] uppercase tracking-[0.14em] lg:tracking-[0.16em] text-neutral-500 whitespace-nowrap">
                    /MONTH
                  </span>
                </div>

                {/* Divider */}
                <div className="my-5 lg:my-7 border-t border-white/[0.08]" />

                {/* Feature List */}
                <ul className="space-y-3 lg:space-y-3.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className={`flex items-start gap-2.5 lg:gap-3 text-[13px] md:text-[12.5px] lg:text-[13.5px] leading-snug ${
                        feature.included ? 'text-neutral-300' : 'text-neutral-600'
                      }`}
                    >
                      {feature.included ? (
                        <Check
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            plan.featured ? 'text-[#FF4D1C]' : 'text-neutral-400'
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <Minus
                          className="w-3.5 h-3.5 mt-0.5 shrink-0 text-neutral-600"
                          aria-hidden="true"
                        />
                      )}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => onSelectPlan(plan.goalValue)}
                className={`group/btn relative mt-7 lg:mt-10 w-full min-h-[46px] lg:min-h-[48px] px-4 md:px-3.5 lg:px-5 py-3.5 lg:py-4 font-mono text-[10.5px] md:text-[10px] lg:text-[11px] font-medium uppercase tracking-[0.15em] lg:tracking-[0.18em] flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C] ${
                  plan.featured
                    ? 'bg-[#FF4D1C] hover:bg-[#E53E10] text-white'
                    : 'border border-white/15 hover:border-white/40 hover:bg-white/[0.05] text-white'
                }`}
              >
                <span className="truncate">{plan.ctaLabel}</span>
                <ArrowRight
                  className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
