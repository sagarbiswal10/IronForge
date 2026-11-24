import { useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProgramsSection } from './components/ProgramsSection';
import { EquipmentSection } from './components/EquipmentSection';
import { MembershipSection } from './components/MembershipSection';
import { TrainersSection } from './components/TrainersSection';
import { ContactSection } from './components/ContactSection';
import { FinalCtaBanner } from './components/FinalCtaBanner';
import { Footer } from './components/Footer';
import { KineticDivider } from './components/KineticDivider';
import { KINETIC_RIBBONS, NAV_ITEMS } from './data/gymData';
import { useScrollAnimations } from './hooks/useScrollAnimations';
import { smoothScrollToSection } from './utils/navigation';

const NAV_SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export default function App() {
  const [selectedGoal, setSelectedGoal] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const heroScrollProgressRef = useRef(0);
  const lockActiveRef = useRef<((sectionId: string, durationMs?: number) => void) | null>(null);

  useScrollAnimations({ rootRef, heroScrollProgressRef });

  const scrollToSection = useCallback((sectionId: string) => {
    lockActiveRef.current?.(sectionId);
    smoothScrollToSection(sectionId);
  }, []);

  // Sync canonical & og:url dynamically and respect direct hash URLs on initial load
  useEffect(() => {
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    let ogUrlMeta = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement('meta');
      ogUrlMeta.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlMeta);
    }
    ogUrlMeta.content = canonicalUrl;

    const initialHash = window.location.hash.replace(/^#/, '');
    if (initialHash && NAV_SECTION_IDS.includes(initialHash) && initialHash !== 'home') {
      lockActiveRef.current?.(initialHash, 900);
      window.requestAnimationFrame(() => {
        smoothScrollToSection(initialHash, { updateHash: false });
      });
    }
  }, []);

  const handleSelectInquiryGoal = useCallback(
    (goalValue: string) => {
      setSelectedGoal(goalValue);
      scrollToSection('contact');
    },
    [scrollToSection],
  );

  const handleJoinGym = useCallback(() => scrollToSection('membership'), [scrollToSection]);
  const handleExplorePrograms = useCallback(() => scrollToSection('programs'), [scrollToSection]);
  const handleScrollToAbout = useCallback(() => scrollToSection('about'), [scrollToSection]);
  const handleBookConsultation = useCallback(
    () => handleSelectInquiryGoal('1-on-1 Coaching Consultation'),
    [handleSelectInquiryGoal],
  );
  const handleBookTour = useCallback(
    () => handleSelectInquiryGoal('Complimentary Gym Tour'),
    [handleSelectInquiryGoal],
  );

  return (
    <div ref={rootRef} className="min-h-screen bg-[#080808] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-[#FF4D1C] focus:text-white focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.16em]"
      >
        Skip to main content
      </a>

      <Navbar
        lockActiveRef={lockActiveRef}
        onNavigateSection={scrollToSection}
        onJoinClick={handleJoinGym}
      />

      <main id="main-content">
        <HeroSection
          onJoinGym={handleJoinGym}
          onExplorePrograms={handleExplorePrograms}
          onScrollToAbout={handleScrollToAbout}
          heroScrollProgressRef={heroScrollProgressRef}
        />

        <KineticDivider
          id="hero-about"
          variant="marquee-left"
          items={KINETIC_RIBBONS.heroToAbout}
          durationSec={26}
        />

        <AboutSection />

        <KineticDivider
          id="about-programs"
          variant="sheen-marquee"
          items={KINETIC_RIBBONS.aboutToPrograms}
          durationSec={30}
        />

        <ProgramsSection onSelectProgram={handleSelectInquiryGoal} />

        <KineticDivider
          id="programs-equipment"
          variant="dual-opposing"
          items={KINETIC_RIBBONS.programsToEquipmentPrimary}
          secondaryItems={KINETIC_RIBBONS.programsToEquipmentSecondary}
          durationSec={28}
        />

        <EquipmentSection />

        <KineticDivider
          id="equipment-membership"
          variant="scroll-scrub"
          items={KINETIC_RIBBONS.equipmentToMembership}
        />

        <MembershipSection onSelectPlan={handleSelectInquiryGoal} />

        <KineticDivider
          id="membership-trainers"
          variant="angled-cross"
          items={KINETIC_RIBBONS.membershipToTrainersPrimary}
          secondaryItems={KINETIC_RIBBONS.membershipToTrainersSecondary}
          durationSec={28}
        />

        <TrainersSection onBookConsultation={handleBookConsultation} />

        <KineticDivider
          id="trainers-contact"
          variant="scroll-scrub-reverse"
          items={KINETIC_RIBBONS.trainersToContact}
        />

        <ContactSection selectedGoal={selectedGoal} />

        <FinalCtaBanner
          onJoinGym={handleJoinGym}
          onBookTour={handleBookTour}
        />
      </main>

      <Footer
        onSelectProgram={handleSelectInquiryGoal}
        onNavigateSection={scrollToSection}
      />
    </div>
  );
}
