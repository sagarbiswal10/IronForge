import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

interface UseScrollAnimationsOptions {
  rootRef: RefObject<HTMLElement | null>;
  heroScrollProgressRef: React.MutableRefObject<number>;
}

/**
 * Orchestrates subtle, cinematic GSAP + ScrollTrigger reveals across the page
 * while respecting prefers-reduced-motion and keeping all properties compositor-only.
 */
export function useScrollAnimations({
  rootRef,
  heroScrollProgressRef,
}: UseScrollAnimationsOptions) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        mobile: '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
      },
      (context) => {
        const isMobile = Boolean(context.conditions?.mobile);
        const yScale = isMobile ? 0.48 : 1;
        const durScale = isMobile ? 0.65 : 1;
        const staggerScale = isMobile ? 0.55 : 1;
        const defaultStart = isMobile ? 'top 93%' : 'top 86%';

        const ctx = gsap.context(() => {
          // 1. Hero entrance (smooth fade-in for text, slight upward reveal for CTAs & metrics)
          const heroText = gsap.utils.toArray<HTMLElement>('[data-anim="hero-text"]');
          const heroCta = gsap.utils.toArray<HTMLElement>('[data-anim="hero-cta"]');
          const heroMetrics = gsap.utils.toArray<HTMLElement>('[data-anim="hero-metrics"]');

          const heroTl = gsap.timeline({
            defaults: { ease: 'power3.out' },
          });

          if (heroText.length) {
            heroTl.fromTo(
              heroText,
              { opacity: 0, y: Math.round(16 * yScale) },
              {
                opacity: 1,
                y: 0,
                duration: 0.78 * durScale,
                stagger: 0.08 * staggerScale,
                clearProps: 'transform',
              },
              0
            );
          }

          if (heroCta.length) {
            heroTl.fromTo(
              heroCta,
              { opacity: 0, y: Math.round(18 * yScale) },
              { opacity: 1, y: 0, duration: 0.72 * durScale, clearProps: 'transform' },
              isMobile ? 0.14 : 0.26
            );
          }

          if (heroMetrics.length) {
            heroTl.fromTo(
              heroMetrics,
              { opacity: 0, y: Math.round(12 * yScale) },
              { opacity: 1, y: 0, duration: 0.7 * durScale, clearProps: 'transform' },
              isMobile ? 0.24 : 0.42
            );
          }

          // 2. Hero 3D barbell & subtle camera scroll progress tracker (zero React re-renders)
          const heroSection = root.querySelector<HTMLElement>('#home, #top');
          if (heroSection) {
            let lastFormatted = '';
            ScrollTrigger.create({
              trigger: heroSection,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              onUpdate: (self) => {
                heroScrollProgressRef.current = self.progress;
                const formatted = self.progress.toFixed(2);
                if (formatted !== lastFormatted) {
                  lastFormatted = formatted;
                  heroSection.dataset.scrollProgress = formatted;
                }
              },
            });
          }

          // Helper for subtle, non-bouncy viewport reveals
          const revealGroup = (
            triggerSelector: string,
            itemSelector: string,
            options: { y?: number; duration?: number; stagger?: number; start?: string } = {}
          ) => {
            const triggerEl = root.querySelector<HTMLElement>(triggerSelector);
            if (!triggerEl) return;
            const items = gsap.utils.toArray<HTMLElement>(itemSelector, triggerEl);
            if (!items.length) return;

            const {
              y = 26,
              duration = 0.85,
              stagger = 0.12,
              start = defaultStart,
            } = options;

            gsap.set(items, { opacity: 0, y: Math.round(y * yScale) });
            gsap.to(items, {
              opacity: 1,
              y: 0,
              duration: duration * durScale,
              stagger: stagger * staggerScale,
              ease: 'power3.out',
              clearProps: 'transform',
              scrollTrigger: {
                trigger: triggerEl,
                start: isMobile ? 'top 93%' : start,
                once: true,
              },
            });
          };

          // 3. About: content fades upward when entering viewport
          revealGroup('#about', '[data-anim="about-reveal"]', {
            y: 26,
            duration: 0.88,
            stagger: 0.14,
            start: 'top 85%',
          });

          // 4. Training Programs: header + sequential card reveals
          revealGroup('#programs', '[data-anim="programs-header"]', {
            y: 22,
            duration: 0.8,
            stagger: 0.08,
            start: 'top 86%',
          });
          revealGroup('#programs', '[data-anim="program-card"]', {
            y: 28,
            duration: 0.82,
            stagger: 0.14,
            start: 'top 82%',
          });

          // 5. Equipment: gallery cards + specification rows reveal smoothly
          revealGroup('#equipment', '[data-anim="equipment-media"]', {
            y: 24,
            duration: 0.85,
            stagger: 0.12,
            start: 'top 85%',
          });
          revealGroup('#equipment', '[data-anim="equipment-text"]', {
            y: 22,
            duration: 0.8,
            stagger: 0.09,
            start: 'top 85%',
          });
          revealGroup('#equipment', '[data-anim="equipment-row"]', {
            y: 14,
            duration: 0.65,
            stagger: 0.07,
            start: 'top 80%',
          });

          // 6. Membership: header + membership cards reveal on scroll
          revealGroup('#membership', '[data-anim="membership-header"]', {
            y: 22,
            duration: 0.8,
            stagger: 0.08,
            start: 'top 86%',
          });
          revealGroup('#membership', '[data-anim="membership-card"]', {
            y: 28,
            duration: 0.82,
            stagger: 0.13,
            start: 'top 82%',
          });

          // 7. Trainers: header + trainer cards fade and move upward slightly
          revealGroup('#trainers', '[data-anim="trainers-header"]', {
            y: 22,
            duration: 0.8,
            stagger: 0.08,
            start: 'top 86%',
          });
          revealGroup('#trainers', '[data-anim="trainer-card"]', {
            y: 24,
            duration: 0.84,
            stagger: 0.14,
            start: 'top 82%',
          });

          // 8. Contact: smooth upward reveal
          revealGroup('#contact', '[data-anim="contact-reveal"]', {
            y: 24,
            duration: 0.85,
            stagger: 0.12,
            start: 'top 86%',
          });

          // 9. Final CTA: smooth reveal animation
          revealGroup('[data-anim="final-cta-section"]', '[data-anim="final-cta-item"]', {
            y: 24,
            duration: 0.9,
            stagger: 0.12,
            start: 'top 92%',
          });

          // 10. Scroll-scrubbed kinetic orange divider bands (compositor-only xPercent & rotation)
          const scrubContainers = gsap.utils.toArray<HTMLElement>(
            '[data-anim="kinetic-scrub-container"]'
          );
          scrubContainers.forEach((container) => {
            const track = container.querySelector<HTMLElement>('[data-anim="kinetic-scrub-track"]');
            if (!track) return;
            const isReverse = container.dataset.scrubDir === 'reverse';
            const shiftPct = isMobile ? 7 : 12;
            const stars = gsap.utils.toArray<HTMLElement>('[data-anim="kinetic-scrub-star"]', track);

            gsap.fromTo(
              track,
              { xPercent: isReverse ? -shiftPct : 0 },
              {
                xPercent: isReverse ? 0 : -shiftPct,
                ease: 'none',
                scrollTrigger: {
                  trigger: container,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: isMobile ? 0.35 : 0.55,
                },
              }
            );

            if (stars.length) {
              gsap.to(stars, {
                rotation: isReverse ? -180 : 180,
                ease: 'none',
                scrollTrigger: {
                  trigger: container,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: isMobile ? 0.35 : 0.55,
                },
              });
            }
          });
        }, root);

        return () => ctx.revert();
      }
    );

    // Ensure trigger positions stay accurate after webfonts settle
    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          ScrollTrigger.refresh();
        }
      });
    }

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, [rootRef, heroScrollProgressRef]);
}
