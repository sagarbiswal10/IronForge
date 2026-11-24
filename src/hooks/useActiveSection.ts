import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NAVBAR_HEIGHT_PX,
  resolveActiveSection,
  type SectionLayoutMetric,
} from '../utils/navigation';

/**
 * Tracks the currently visible section while scrolling without causing layout
 * thrashing on every scroll frame. Section geometry is measured on mount, resize,
 * and document height changes, while scroll ticks only read window.scrollY.
 */
export function useActiveSection(sectionIds: readonly string[]) {
  const [activeSection, setActiveSection] = useState<string>(
    sectionIds[0] ?? 'home',
  );
  const lockUntilRef = useRef<number>(0);
  const metricsRef = useRef<SectionLayoutMetric[]>([]);
  const docHeightRef = useRef<number>(0);
  const viewportHeightRef = useRef<number>(0);

  const lockActiveSection = useCallback((sectionId: string, durationMs = 750) => {
    setActiveSection((prev) => (prev === sectionId ? prev : sectionId));
    lockUntilRef.current = performance.now() + durationMs;
  }, []);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    let rafId: number | null = null;
    let measureRafId: number | null = null;

    const measureSections = () => {
      measureRafId = null;
      const scrollY = window.scrollY;
      const nextMetrics: SectionLayoutMetric[] = [];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        nextMetrics.push({
          id,
          top: rect.top + scrollY,
          height: rect.height,
        });
      }

      metricsRef.current = nextMetrics;
      docHeightRef.current = document.documentElement.scrollHeight;
      viewportHeightRef.current = window.innerHeight;
    };

    const updateActive = () => {
      rafId = null;
      if (performance.now() < lockUntilRef.current) {
        return;
      }

      if (metricsRef.current.length === 0) {
        measureSections();
      }
      if (metricsRef.current.length === 0) return;

      const nextActive = resolveActiveSection(
        metricsRef.current,
        window.scrollY,
        viewportHeightRef.current || window.innerHeight,
        docHeightRef.current || document.documentElement.scrollHeight,
        NAVBAR_HEIGHT_PX,
      );

      setActiveSection((prev) => (prev === nextActive ? prev : nextActive));
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateActive);
    };

    const scheduleMeasureAndUpdate = () => {
      if (measureRafId !== null) return;
      measureRafId = window.requestAnimationFrame(() => {
        measureSections();
        updateActive();
      });
    };

    const handleUserScrollIntent = () => {
      if (lockUntilRef.current > 0) {
        lockUntilRef.current = 0;
        scheduleUpdate();
      }
    };

    measureSections();
    updateActive();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      ro = new ResizeObserver(scheduleMeasureAndUpdate);
      ro.observe(document.body);
    }

    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) scheduleMeasureAndUpdate();
      });
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleMeasureAndUpdate, { passive: true });
    window.addEventListener('wheel', handleUserScrollIntent, { passive: true });
    window.addEventListener('touchstart', handleUserScrollIntent, { passive: true });

    return () => {
      cancelled = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (measureRafId !== null) window.cancelAnimationFrame(measureRafId);
      ro?.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleMeasureAndUpdate);
      window.removeEventListener('wheel', handleUserScrollIntent);
      window.removeEventListener('touchstart', handleUserScrollIntent);
    };
  }, [sectionIds]);

  return { activeSection, lockActiveSection };
}
