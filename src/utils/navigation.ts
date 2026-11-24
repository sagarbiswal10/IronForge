export const NAVBAR_HEIGHT_PX = 72;

export interface SectionLayoutMetric {
  id: string;
  top: number;
  height: number;
}

/**
 * Computes the vertical scroll destination for a section, accounting for the
 * sticky navigation bar height and always returning 0 for the Home section.
 */
export function computeScrollTargetTop(
  sectionId: string,
  sectionDocumentTop: number,
  headerHeight: number = NAVBAR_HEIGHT_PX,
): number {
  if (sectionId === 'home') {
    return 0;
  }
  return Math.max(0, Math.round(sectionDocumentTop - headerHeight));
}

/**
 * Determines which navigation section is currently active given scroll position,
 * viewport height, total document height, and ordered section metrics.
 */
export function resolveActiveSection(
  sections: SectionLayoutMetric[],
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
  headerHeight: number = NAVBAR_HEIGHT_PX,
): string {
  if (sections.length === 0) {
    return 'home';
  }

  // Always highlight Home near the very top of the page.
  if (scrollY <= 36) {
    return sections[0].id;
  }

  // When scrolled to the bottom of the document (including footer/CTA banner),
  // keep the final navigation section (Contact) highlighted.
  if (
    documentHeight > viewportHeight &&
    scrollY + viewportHeight >= documentHeight - 24
  ) {
    return sections[sections.length - 1].id;
  }

  // Activation threshold sits slightly below the sticky header so the section
  // occupying the top-third focus band of the viewport becomes active.
  const activationLine = scrollY + headerHeight + Math.min(viewportHeight * 0.25, 180);

  let activeId = sections[0].id;
  for (const section of sections) {
    if (section.top <= activationLine) {
      activeId = section.id;
    } else {
      break;
    }
  }

  return activeId;
}

/**
 * Smoothly scrolls the window to a target section ID without reloading the page
 * and respects prefers-reduced-motion.
 */
export function smoothScrollToSection(
  sectionId: string,
  options?: { updateHash?: boolean },
): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  if (sectionId === 'home') {
    window.scrollTo({ top: 0, behavior });
    if (options?.updateHash !== false) {
      window.history.replaceState(null, '', '#home');
    }
    return true;
  }

  const target = document.getElementById(sectionId);
  if (!target) {
    return false;
  }

  const sectionDocumentTop = target.getBoundingClientRect().top + window.scrollY;
  const destinationTop = computeScrollTargetTop(
    sectionId,
    sectionDocumentTop,
    NAVBAR_HEIGHT_PX,
  );

  window.scrollTo({ top: destinationTop, behavior });

  if (options?.updateHash !== false) {
    window.history.replaceState(null, '', `#${sectionId}`);
  }

  return true;
}
