import { memo, useState, type FormEvent, type MouseEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { CONTACT_LINKS } from '../data/gymData';
import { validateNewsletterEmail } from '../utils/validation';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onSelectProgram: (goalValue: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer = memo(function Footer({
  onSelectProgram,
  onNavigateSection,
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const handleSectionLink = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (onNavigateSection) {
      event.preventDefault();
      onNavigateSection(sectionId);
    }
  };

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateNewsletterEmail(email);
    if (!result.isValid) {
      setError(result.error ?? 'Enter a valid email address.');
      return;
    }
    setError(null);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer
      aria-labelledby="footer-heading"
      className="section-contain border-t border-white/[0.08] bg-[#080808] pt-12 sm:pt-16 pb-8 sm:pb-10"
    >
      <h2 id="footer-heading" className="sr-only">
        IRONFORGE FITNESS Footer
      </h2>
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-9 md:gap-8 lg:gap-12 pb-10 sm:pb-14 border-b border-white/[0.08]">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <BrandLogo onNavigateHome={onNavigateSection ? () => onNavigateSection('home') : undefined} />
            <p className="mt-4 sm:mt-5 text-[13px] leading-relaxed text-neutral-500 max-w-xs">
              A private strength club for bodybuilders, powerlifters and serious
              lifters. Brooklyn, NY.
            </p>

            {/* Social Links */}
            <div className="mt-5 sm:mt-6 flex items-center gap-2.5">
              <a
                href={CONTACT_LINKS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ironforge Fitness on Instagram"
                className="w-9 h-9 border border-white/15 hover:border-white/40 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="#contact"
                aria-label="Ironforge Fitness on YouTube"
                className="w-9 h-9 border border-white/15 hover:border-white/40 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
              <a
                href="#contact"
                aria-label="Ironforge Fitness on TikTok"
                className="w-9 h-9 border border-white/15 hover:border-white/40 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Club & Train Links — 2-column row on mobile, seamless 12-col children on md+ */}
          <div className="grid grid-cols-2 gap-8 md:contents">
            {/* Club Links */}
            <nav aria-labelledby="footer-club-heading" className="md:col-span-2">
              <h3
                id="footer-club-heading"
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
              >
                CLUB
              </h3>
              <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 text-[13.5px] text-neutral-300">
                <li>
                  <a
                    href="#about"
                    onClick={(e) => handleSectionLink(e, 'about')}
                    className="inline-block py-0.5 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#equipment"
                    onClick={(e) => handleSectionLink(e, 'equipment')}
                    className="inline-block py-0.5 hover:text-white transition-colors"
                  >
                    Equipment
                  </a>
                </li>
                <li>
                  <a
                    href="#trainers"
                    onClick={(e) => handleSectionLink(e, 'trainers')}
                    className="inline-block py-0.5 hover:text-white transition-colors"
                  >
                    Trainers
                  </a>
                </li>
              </ul>
            </nav>

            {/* Train Links */}
            <nav aria-labelledby="footer-train-heading" className="md:col-span-2">
              <h3
                id="footer-train-heading"
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
              >
                TRAIN
              </h3>
              <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 text-[13.5px] text-neutral-300">
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectProgram('Bodybuilding — 12 Week Hypertrophy')}
                    className="inline-block py-0.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Bodybuilding
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectProgram('Powerlifting — 16 Week Meet Prep')}
                    className="inline-block py-0.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Powerlifting
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectProgram('Personal Training — 1-on-1 Coaching')}
                    className="inline-block py-0.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Personal Training
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              NEWSLETTER
            </h3>

            {subscribed ? (
              <p
                role="status"
                aria-live="polite"
                className="mt-5 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-[#FF4D1C]"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>YOU&apos;RE ON THE LIST.</span>
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} noValidate className="mt-5">
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  Newsletter email address
                </label>
                <div className="flex items-center border-b border-white/15 focus-within:border-[#FF4D1C] pb-2.5 transition-colors">
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'newsletter-error' : undefined}
                    className="w-full bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none pr-3"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to Ironforge newsletter"
                    className="w-8 h-8 flex items-center justify-center text-[#FF4D1C] hover:text-white transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C]"
                  >
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                {error && (
                  <p
                    id="newsletter-error"
                    role="alert"
                    className="mt-2 text-xs text-[#FF4D1C]"
                  >
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          <p>© 2025 IRONFORGE FITNESS</p>
          <div className="flex items-center gap-6">
            <a href="#contact" className="hover:text-neutral-300 transition-colors">
              PRIVACY
            </a>
            <a href="#contact" className="hover:text-neutral-300 transition-colors">
              TERMS
            </a>
            <a href="#contact" className="hover:text-neutral-300 transition-colors">
              CAREERS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});
