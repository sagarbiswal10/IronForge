import { memo, useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Instagram,
  MapPin,
} from 'lucide-react';
import { CONTACT_LINKS } from '../data/gymData';
import {
  validateTourBooking,
  type TourFormData,
  type TourFormErrors,
} from '../utils/validation';
import { SectionKicker } from './SectionKicker';

interface ContactSectionProps {
  selectedGoal: string;
}

const INITIAL_FORM: TourFormData = {
  fullName: '',
  email: '',
  phone: '',
  primaryGoal: '',
  message: '',
};

export const ContactSection = memo(function ContactSection({
  selectedGoal,
}: ContactSectionProps) {
  const [formData, setFormData] = useState<TourFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<TourFormErrors>({});
  const [submittedBooking, setSubmittedBooking] = useState<TourFormData | null>(null);

  useEffect(() => {
    if (selectedGoal) {
      setFormData((prev) => ({ ...prev, primaryGoal: selectedGoal }));
      setErrors((prev) => ({ ...prev, primaryGoal: undefined }));
      setSubmittedBooking(null);
    }
  }, [selectedGoal]);

  const handleFieldChange = (field: keyof TourFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateTourBooking(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmittedBooking({ ...formData });
  };

  const handleReset = () => {
    setSubmittedBooking(null);
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="section-contain border-t border-white/[0.07] bg-[#080808] py-16 sm:py-22 lg:py-32 scroll-mt-[64px] sm:scroll-mt-[72px]"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Contact Information */}
          <div data-anim="contact-reveal" className="lg:col-span-5 min-w-0">
            <SectionKicker label="CONTACT" />

            <h2
              id="contact-heading"
              className="mt-5 sm:mt-6 font-display uppercase leading-[0.94] tracking-[0.015em] text-[clamp(2.25rem,4.6vw,4.1rem)] text-white"
            >
              <span className="block">BOOK A FREE</span>
              <span className="block">TOUR.</span>
            </h2>

            <p className="mt-5 sm:mt-6 text-[14.5px] sm:text-[15px] leading-[1.65] text-neutral-400 max-w-sm">
              Walk the floor, meet the coaches and train one session on us. We
              reply within 24 hours.
            </p>

            <address className="not-italic">
              <dl className="mt-9 sm:mt-11 lg:mt-12 pt-7 sm:pt-8 border-t border-white/[0.08] space-y-5 sm:space-y-6">
              {/* Address */}
              <div className="grid grid-cols-[76px_1fr] sm:grid-cols-[96px_1fr] gap-3 sm:gap-4 items-start">
                <dt className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-neutral-500 pt-0.5">
                  ADDRESS
                </dt>
                <dd className="text-sm leading-relaxed text-neutral-200 min-w-0">
                  <span className="block">418 Foundry Street</span>
                  <span className="block">Brooklyn, NY 11211</span>
                </dd>
              </div>

              {/* Opening Hours */}
              <div className="grid grid-cols-[76px_1fr] sm:grid-cols-[96px_1fr] gap-3 sm:gap-4 items-start">
                <dt className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-neutral-500 pt-0.5">
                  HOURS
                </dt>
                <dd className="text-sm leading-relaxed text-neutral-200 min-w-0">
                  <span className="block">Staffed daily, 6am–11pm</span>
                  <span className="block">Members 24/7</span>
                </dd>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-[76px_1fr] sm:grid-cols-[96px_1fr] gap-3 sm:gap-4 items-start">
                <dt className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-neutral-500 pt-0.5">
                  REACH
                </dt>
                <dd className="text-sm leading-relaxed text-neutral-200 space-y-1 min-w-0 break-words">
                  <a
                    href={CONTACT_LINKS.phoneHref}
                    className="block hover:text-[#FF4D1C] transition-colors tabular-nums"
                  >
                    {CONTACT_LINKS.phoneDisplay}
                  </a>
                  <a
                    href={CONTACT_LINKS.emailHref}
                    className="block hover:text-[#FF4D1C] transition-colors"
                  >
                    {CONTACT_LINKS.emailDisplay}
                  </a>
                </dd>
              </div>

              {/* Instagram */}
              <div className="grid grid-cols-[76px_1fr] sm:grid-cols-[96px_1fr] gap-3 sm:gap-4 items-start">
                <dt className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-neutral-500 pt-0.5">
                  SOCIAL
                </dt>
                <dd className="text-sm leading-relaxed text-neutral-200 min-w-0">
                  <a
                    href={CONTACT_LINKS.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-[#FF4D1C] transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
                    <span>{CONTACT_LINKS.instagramHandle}</span>
                    <ArrowUpRight className="w-3 h-3 text-neutral-500 shrink-0" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>
            </address>

            {/* Google Maps Action Button */}
            <div className="mt-7 sm:mt-8 pt-6 border-t border-white/[0.08]">
              <a
                href={CONTACT_LINKS.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-between gap-4 w-full sm:w-auto border border-white/15 hover:border-[#FF4D1C] bg-[#0E0E0E] hover:bg-[#141414] px-5 py-3.5 font-mono text-[10.5px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-neutral-200 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C]"
              >
                <span className="inline-flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4D1C] shrink-0" aria-hidden="true" />
                  <span>OPEN IN GOOGLE MAPS</span>
                </span>
                <ArrowUpRight
                  className="w-3.5 h-3.5 shrink-0 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          {/* Right Form Card */}
          <div
            data-anim="contact-reveal"
            className="lg:col-span-7 min-w-0 bg-[#111111] border border-white/[0.08] p-5 sm:p-9 lg:p-11"
          >
            {submittedBooking ? (
              <div
                role="status"
                aria-live="polite"
                data-testid="contact-success"
                className="py-8 flex flex-col items-start"
              >
                <div className="inline-flex items-center gap-2.5 text-[#FF4D1C] font-mono text-xs uppercase tracking-[0.18em]">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>REQUEST CONFIRMED</span>
                </div>
                <h3 className="mt-4 font-display text-3xl sm:text-4xl uppercase tracking-[0.02em] text-white">
                  THANKS! WE&apos;LL CONTACT YOU SHORTLY.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400 max-w-md">
                  We received your inquiry for{' '}
                  <span className="text-white">{submittedBooking.fullName.trim()}</span>{' '}
                  and will reach out via{' '}
                  <span className="text-white">{submittedBooking.email}</span>{' '}
                  or{' '}
                  <span className="text-white tabular-nums">{submittedBooking.phone}</span>{' '}
                  within 24 hours.
                </p>

                <dl className="mt-8 w-full border-t border-white/[0.08] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {submittedBooking.primaryGoal.trim() && (
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                        PRIMARY GOAL
                      </dt>
                      <dd className="mt-1 text-white">{submittedBooking.primaryGoal}</dd>
                    </div>
                  )}
                  <div className={submittedBooking.primaryGoal.trim() ? '' : 'sm:col-span-2'}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                      MESSAGE
                    </dt>
                    <dd className="mt-1 text-neutral-200">{submittedBooking.message}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-8 border border-white/20 hover:border-white px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors cursor-pointer"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="tour-full-name"
                      className="block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
                    >
                      FULL NAME
                    </label>
                    <input
                      id="tour-full-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="John Carter"
                      value={formData.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'tour-full-name-error' : undefined}
                      className="mt-2.5 w-full bg-transparent border-b border-white/15 focus:border-[#FF4D1C] pb-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                    />
                    {errors.fullName && (
                      <p
                        id="tour-full-name-error"
                        role="alert"
                        className="mt-2 text-xs text-[#FF4D1C]"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="tour-email"
                      className="block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
                    >
                      EMAIL
                    </label>
                    <input
                      id="tour-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="john@email.com"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'tour-email-error' : undefined}
                      className="mt-2.5 w-full bg-transparent border-b border-white/15 focus:border-[#FF4D1C] pb-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                    />
                    {errors.email && (
                      <p
                        id="tour-email-error"
                        role="alert"
                        className="mt-2 text-xs text-[#FF4D1C]"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="tour-phone"
                      className="block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
                    >
                      PHONE
                    </label>
                    <input
                      id="tour-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="+1 (000) 000-0000"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'tour-phone-error' : undefined}
                      className="mt-2.5 w-full bg-transparent border-b border-white/15 focus:border-[#FF4D1C] pb-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                    />
                    {errors.phone && (
                      <p
                        id="tour-phone-error"
                        role="alert"
                        className="mt-2 text-xs text-[#FF4D1C]"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Primary Goal */}
                  <div>
                    <label
                      htmlFor="tour-goal"
                      className="block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
                    >
                      PRIMARY GOAL
                    </label>
                    <input
                      id="tour-goal"
                      name="primaryGoal"
                      type="text"
                      placeholder="Build muscle"
                      value={formData.primaryGoal}
                      onChange={(e) => handleFieldChange('primaryGoal', e.target.value)}
                      aria-invalid={Boolean(errors.primaryGoal)}
                      aria-describedby={errors.primaryGoal ? 'tour-goal-error' : undefined}
                      className="mt-2.5 w-full bg-transparent border-b border-white/15 focus:border-[#FF4D1C] pb-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                    />
                    {errors.primaryGoal && (
                      <p
                        id="tour-goal-error"
                        role="alert"
                        className="mt-2 text-xs text-[#FF4D1C]"
                      >
                        {errors.primaryGoal}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="mt-8">
                  <label
                    htmlFor="tour-message"
                    className="block font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
                  >
                    MESSAGE
                  </label>
                  <textarea
                    id="tour-message"
                    name="message"
                    rows={3}
                    required
                    placeholder="Tell us about your training background or preferred tour day"
                    value={formData.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'tour-message-error' : undefined}
                    className="mt-2.5 w-full resize-none bg-transparent border-b border-white/15 focus:border-[#FF4D1C] pb-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                  />
                  {errors.message && (
                    <p
                      id="tour-message-error"
                      role="alert"
                      className="mt-2 text-xs text-[#FF4D1C]"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Form Footer */}
                <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
                  <p className="text-[11.5px] text-neutral-500">
                    By submitting you agree to our privacy policy.
                  </p>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-white hover:bg-neutral-200 text-[#080808] px-7 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D1C]"
                  >
                    <span>BOOK MY TOUR</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});
