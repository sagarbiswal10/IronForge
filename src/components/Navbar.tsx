import { memo, useCallback, useEffect, useState, type MouseEvent, type MutableRefObject } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '../data/gymData';
import { useActiveSection } from '../hooks/useActiveSection';
import { BrandLogo } from './BrandLogo';

const NAV_SECTION_IDS = NAV_ITEMS.map((item) => item.id);

interface NavbarProps {
  onNavigateSection: (sectionId: string) => void;
  onJoinClick: () => void;
  lockActiveRef: MutableRefObject<((sectionId: string, durationMs?: number) => void) | null>;
}

/**
 * Isolates active-section scroll state inside Navbar so scrolling across sections
 * never triggers re-renders in App or any below-the-fold page sections.
 */
export const Navbar = memo(function Navbar({
  onNavigateSection,
  onJoinClick,
  lockActiveRef,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeSection, lockActiveSection } = useActiveSection(NAV_SECTION_IDS);

  useEffect(() => {
    lockActiveRef.current = lockActiveSection;
    return () => {
      lockActiveRef.current = null;
    };
  }, [lockActiveRef, lockActiveSection]);

  const handleLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      event.preventDefault();
      setMobileMenuOpen(false);
      onNavigateSection(sectionId);
    },
    [onNavigateSection],
  );

  const handleHomeClick = useCallback(() => {
    setMobileMenuOpen(false);
    onNavigateSection('home');
  }, [onNavigateSection]);

  const handleJoin = useCallback(() => {
    setMobileMenuOpen(false);
    onJoinClick();
  }, [onJoinClick]);

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/95 lg:backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 h-[64px] sm:h-[72px] flex items-center justify-between gap-4 lg:gap-6">
        <BrandLogo showSubtext onNavigateHome={handleHomeClick} />

        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-8"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`font-mono text-[10.5px] uppercase tracking-[0.16em] xl:tracking-[0.18em] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:text-white focus-visible:underline ${
                  isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleJoin}
            className="hidden sm:inline-flex items-center justify-center border border-white/25 px-4 lg:px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white hover:bg-white hover:text-[#080808] hover:border-white transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C]"
          >
            JOIN NOW
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 border border-white/15 text-white hover:border-white/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-white/[0.08] bg-[#0B0B0B] px-4 sm:px-6 py-5 max-h-[calc(100dvh-64px)] overflow-y-auto"
        >
          <div className="flex flex-col space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`font-mono text-xs uppercase tracking-[0.2em] py-3.5 border-b border-white/[0.05] transition-colors ${
                    isActive ? 'text-[#FF4D1C]' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleJoin}
            className="mt-5 w-full bg-[#FF4D1C] hover:bg-[#E53E10] text-white py-3.5 font-mono text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
          >
            JOIN NOW
          </button>
        </nav>
      )}
    </header>
  );
});
