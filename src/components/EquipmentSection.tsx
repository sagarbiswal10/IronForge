import { Suspense, lazy, memo, useCallback, useEffect, useRef, useState } from 'react';
import { EQUIPMENT_GALLERY, EQUIPMENT_SPECS } from '../data/gymData';
import { ResilientImage } from './ResilientImage';
import { SectionKicker } from './SectionKicker';
import {
  mapSpecIdToEquipmentKind,
  type EquipmentKind,
} from './three/equipmentMath';

const Equipment3DCard = lazy(() => import('./three/Equipment3DCard'));

function EquipmentCardFallback({
  name,
  caption,
  src,
  alt,
  aspectClassName,
}: {
  name: string;
  caption: string;
  src: string;
  alt: string;
  aspectClassName: string;
}) {
  return (
    <article
      data-anim="equipment-media"
      className={`relative ${aspectClassName} w-full max-w-full min-w-0 overflow-hidden border border-white/[0.08] bg-[#0d0d0d]`}
    >
      <ResilientImage
        src={src}
        alt={alt}
        className="w-full h-full object-cover object-center opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
      />
      <div className="pointer-events-none absolute left-4 sm:left-5 bottom-3.5 sm:bottom-4 right-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base sm:text-lg uppercase tracking-[0.04em] text-white leading-none">
          {name}
        </h3>
        <span className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.16em] text-neutral-400 truncate">
          {caption}
        </span>
      </div>
    </article>
  );
}

export const EquipmentSection = memo(function EquipmentSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoad3D, setShouldLoad3D] = useState(false);
  const [activeSpecId, setActiveSpecId] = useState<string | null>(null);
  const [activeEquipment, setActiveEquipment] = useState<EquipmentKind | null>(null);

  // Defer downloading & parsing the Equipment 3D bundle until approaching viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldLoad3D(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad3D(true);
          observer.disconnect();
        }
      },
      { rootMargin: '420px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSpecToggle = useCallback((specId: string) => {
    setActiveSpecId((prev) => {
      const next = prev === specId ? null : specId;
      setActiveEquipment(mapSpecIdToEquipmentKind(next));
      return next;
    });
  }, []);

  const activateSquatRack = useCallback(() => setActiveEquipment('squat-rack'), []);
  const activateBarbell = useCallback(() => setActiveEquipment('olympic-barbell'), []);
  const activateDumbbell = useCallback(() => setActiveEquipment('dumbbell'), []);

  const rackFallback = (
    <EquipmentCardFallback
      name="SQUAT RACK"
      caption="42 STATIONS"
      src={EQUIPMENT_GALLERY.rackRow.src}
      alt={EQUIPMENT_GALLERY.rackRow.alt}
      aspectClassName="aspect-[16/10]"
    />
  );

  const barbellFallback = (
    <EquipmentCardFallback
      name="OLYMPIC BARBELL"
      caption="20 KG · IPF"
      src={EQUIPMENT_GALLERY.plates.src}
      alt={EQUIPMENT_GALLERY.plates.alt}
      aspectClassName="aspect-[16/11] sm:aspect-[4/3]"
    />
  );

  const dumbbellFallback = (
    <EquipmentCardFallback
      name="DUMBBELL"
      caption="UP TO 80 KG"
      src={EQUIPMENT_GALLERY.dumbbells.src}
      alt={EQUIPMENT_GALLERY.dumbbells.alt}
      aspectClassName="aspect-[16/11] sm:aspect-[4/3]"
    />
  );

  return (
    <section
      ref={sectionRef}
      id="equipment"
      aria-labelledby="equipment-heading"
      className="section-contain border-t border-white/[0.07] bg-[#080808] py-16 sm:py-22 lg:py-32 scroll-mt-[64px] sm:scroll-mt-[72px]"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-14 items-center">
          {/* Left 3-Slot Asymmetric Interactive 3D Equipment Showcase */}
          <div className="lg:col-span-7 min-w-0 flex flex-col gap-3.5 sm:gap-4">
            {shouldLoad3D ? (
              <Suspense fallback={rackFallback}>
                <Equipment3DCard
                  kind="squat-rack"
                  name="SQUAT RACK"
                  caption="42 STATIONS"
                  fallbackSrc={EQUIPMENT_GALLERY.rackRow.src}
                  fallbackAlt={EQUIPMENT_GALLERY.rackRow.alt}
                  aspectClassName="aspect-[16/10]"
                  isActive={activeEquipment === 'squat-rack'}
                  onActivate={activateSquatRack}
                />
              </Suspense>
            ) : (
              rackFallback
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {shouldLoad3D ? (
                <>
                  <Suspense fallback={barbellFallback}>
                    <Equipment3DCard
                      kind="olympic-barbell"
                      name="OLYMPIC BARBELL"
                      caption="20 KG · IPF"
                      fallbackSrc={EQUIPMENT_GALLERY.plates.src}
                      fallbackAlt={EQUIPMENT_GALLERY.plates.alt}
                      aspectClassName="aspect-[16/11] sm:aspect-[4/3]"
                      isActive={activeEquipment === 'olympic-barbell'}
                      onActivate={activateBarbell}
                    />
                  </Suspense>
                  <Suspense fallback={dumbbellFallback}>
                    <Equipment3DCard
                      kind="dumbbell"
                      name="DUMBBELL"
                      caption="UP TO 80 KG"
                      fallbackSrc={EQUIPMENT_GALLERY.dumbbells.src}
                      fallbackAlt={EQUIPMENT_GALLERY.dumbbells.alt}
                      aspectClassName="aspect-[16/11] sm:aspect-[4/3]"
                      isActive={activeEquipment === 'dumbbell'}
                      onActivate={activateDumbbell}
                    />
                  </Suspense>
                </>
              ) : (
                <>
                  {barbellFallback}
                  {dumbbellFallback}
                </>
              )}
            </div>
          </div>

          {/* Right Equipment Specifications */}
          <div className="lg:col-span-5 min-w-0 flex flex-col">
            <div data-anim="equipment-text">
              <SectionKicker label="EQUIPMENT" />

              <h2
                id="equipment-heading"
                className="mt-5 sm:mt-6 font-display uppercase leading-[0.94] tracking-[0.015em] text-[clamp(2.2rem,4.4vw,3.9rem)] text-white"
              >
                <span className="block">COMPETITION-</span>
                <span className="block">GRADE IRON.</span>
              </h2>

              <p className="mt-4 sm:mt-5 text-[14px] sm:text-[14.5px] leading-[1.65] text-neutral-400 max-w-md">
                Selected by lifters, for lifters — calibrated, maintained daily
                and built for maximal loads.
              </p>
            </div>

            <ul className="mt-8 lg:mt-10 border-t border-white/[0.08]" aria-label="Equipment inventory">
              {EQUIPMENT_SPECS.map((spec) => {
                const isExpanded = activeSpecId === spec.id;
                return (
                  <li
                    key={spec.id}
                    data-anim="equipment-row"
                    className="border-b border-white/[0.08]"
                  >
                    <button
                      type="button"
                      onClick={() => handleSpecToggle(spec.id)}
                      aria-expanded={isExpanded}
                      className="w-full py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 text-left group cursor-pointer focus-visible:outline-none focus-visible:text-[#FF4D1C]"
                    >
                      <span className="flex items-center min-w-0">
                        <span className="font-display text-[16px] sm:text-[19px] uppercase tracking-[0.03em] text-white group-hover:text-[#FF4D1C] transition-colors truncate">
                          {spec.name}
                        </span>
                      </span>
                      <span className="font-mono text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-neutral-500 tabular-nums whitespace-nowrap shrink-0">
                        {spec.detail}
                      </span>
                    </button>
                    {isExpanded && (
                      <p className="pb-4 pr-2 text-xs leading-relaxed text-neutral-400">
                        {spec.caption}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
});
