export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface MetricItem {
  value: string;
  accentSuffix?: string;
  label: string;
}

export interface ProgramItem {
  id: string;
  duration: string;
  title: string;
  description: string;
  schedule: string;
  goalValue: string;
  image: string;
  imageAlt: string;
}

export interface EquipmentSpec {
  id: string;
  name: string;
  detail: string;
  caption: string;
}

export interface MembershipFeature {
  text: string;
  included: boolean;
}

export interface MembershipPlan {
  id: string;
  badge: string;
  name: string;
  subtitle: string;
  price: number;
  priceDisplay: string;
  featured: boolean;
  ctaLabel: string;
  goalValue: string;
  features: MembershipFeature[];
}

export interface TrainerItem {
  id: string;
  name: string;
  role: string;
  credential: string;
  bio: string;
  image: string;
  imageAlt: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', href: '#home' },
  { id: 'about', label: 'ABOUT', href: '#about' },
  { id: 'programs', label: 'PROGRAMS', href: '#programs' },
  { id: 'equipment', label: 'EQUIPMENT', href: '#equipment' },
  { id: 'membership', label: 'MEMBERSHIP', href: '#membership' },
  { id: 'trainers', label: 'TRAINERS', href: '#trainers' },
  { id: 'contact', label: 'CONTACT', href: '#contact' },
];

export const HERO_BARBELL_IMAGE =
  '/src/assets/images/hero_olympic_barbell_1795503442025.webp';

export const ABOUT_FLOOR_IMAGE =
  '/src/assets/images/about_main_floor_1795503442443.webp';

export const FINAL_CTA_IMAGE =
  '/src/assets/images/cta_iron_silhouette_1795503442895.webp';

export const HERO_METRICS: MetricItem[] = [
  { value: '24/7', label: 'ACCESS' },
  { value: '18K', label: 'SQ FT OF IRON' },
  { value: '42', label: 'COMP RACKS' },
];

export const ABOUT_STATS: MetricItem[] = [
  { value: '12', accentSuffix: '+', label: 'YEARS OPEN' },
  { value: '2.4K', label: 'MEMBERS' },
  { value: '96', label: 'PRO TITLES' },
];

export const PROGRAMS: ProgramItem[] = [
  {
    id: 'bodybuilding',
    duration: '12 WEEKS',
    title: 'BODYBUILDING',
    description:
      'Hypertrophy splits, nutrition protocols and posing prep for stage-ready physiques.',
    schedule: '5× / WEEK  ·  ALL LEVELS',
    goalValue: 'Bodybuilding — 12 Week Hypertrophy',
    image: '/src/assets/images/program_bodybuilding_1795503442764.webp',
    imageAlt: 'Bodybuilder performing a heavy dumbbell curl under low-key gym lighting',
  },
  {
    id: 'powerlifting',
    duration: '16 WEEKS',
    title: 'POWERLIFTING',
    description:
      'Squat, bench and deadlift mastery with meet-prep cycles and technique audits.',
    schedule: '4× / WEEK  ·  INTERMEDIATE+',
    goalValue: 'Powerlifting — 16 Week Meet Prep',
    image: '/src/assets/images/program_powerlifting_1795503440899.webp',
    imageAlt: 'Powerlifter setting up for a heavy deadlift with calibrated steel plates',
  },
  {
    id: 'personal-training',
    duration: '1-ON-1',
    title: 'PERSONAL TRAINING',
    description:
      'Private coaching built around your body, goals and schedule — with weekly check-ins.',
    schedule: 'FLEXIBLE  ·  TAILORED',
    goalValue: 'Personal Training — 1-on-1 Coaching',
    image: '/src/assets/images/program_personal_training_1795503442197.webp',
    imageAlt: 'Strength coach guiding an athlete during a private barbell training session',
  },
];

export const EQUIPMENT_GALLERY = {
  rackRow: {
    src: '/src/assets/images/equipment_rack_row_1795503443810.webp',
    alt: 'Row of matte black competition combo and power racks under linear overhead lights',
    caption: 'RACK ROW — 42 STATIONS',
  },
  plates: {
    src: '/src/assets/images/equipment_calibrated_plates_1795503440246.webp',
    alt: 'Close-up of competition calibrated weight plates loaded on a knurled barbell sleeve',
  },
  dumbbells: {
    src: '/src/assets/images/equipment_dumbbells_1795503442402.webp',
    alt: 'Precision row of heavy matte black knurled steel dumbbells up to 80 kg',
  },
};

export const EQUIPMENT_SPECS: EquipmentSpec[] = [
  {
    id: 'racks',
    name: 'COMBO & POWER RACKS',
    detail: '×42',
    caption: 'Competition-spec competition racks with laser-numbered uprights and calibrated j-cups.',
  },
  {
    id: 'plates',
    name: 'CALIBRATED PLATES',
    detail: 'IPF SPEC',
    caption: 'Machine-calibrated cast steel discs accurate to ±10 grams across every platform.',
  },
  {
    id: 'dumbbells',
    name: 'DUMBBELLS TO 80 KG',
    detail: '2.5 KG STEPS',
    caption: 'Custom solid-steel knurled dumbbells welded in 2.5 kg increments up to 80 kg.',
  },
  {
    id: 'machines',
    name: 'PLATE-LOADED MACHINES',
    detail: '×68',
    caption: 'Converging biomechanical leverage stations engineered for maximal hypertrophy tension.',
  },
  {
    id: 'platforms',
    name: 'DEADLIFT PLATFORMS',
    detail: '×12',
    caption: 'Oak-core competition deadlift stages with high-density shock-absorbing rubber wings.',
  },
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'starter',
    badge: 'MONTHLY',
    name: 'STARTER',
    subtitle: 'For disciplined self-starters',
    price: 1499,
    priceDisplay: '1,499',
    featured: false,
    ctaLabel: 'START TRAINING',
    goalValue: 'Starter Membership (₹1,499/month)',
    features: [
      { text: 'Full strength floor access, 6am–11pm', included: true },
      { text: 'Competition racks, free weights & cardio', included: true },
      { text: 'Locker room, showers & chalk stations', included: true },
      { text: '1 complimentary onboarding assessment', included: true },
    ],
  },
  {
    id: 'pro',
    badge: 'MOST POPULAR',
    name: 'PRO',
    subtitle: 'For committed lifters chasing numbers',
    price: 2499,
    priceDisplay: '2,499',
    featured: true,
    ctaLabel: 'JOIN PRO',
    goalValue: 'Pro Membership (₹2,499/month)',
    features: [
      { text: '24/7 biometric & keycard club access', included: true },
      { text: 'All bodybuilding & powerlifting programs', included: true },
      { text: 'Monthly body composition & strength scan', included: true },
      { text: 'Recovery zone, sauna & mobility bay', included: true },
      { text: 'Priority platform & comp rack booking', included: true },
    ],
  },
  {
    id: 'elite',
    badge: 'MONTHLY',
    name: 'ELITE',
    subtitle: 'The full private club experience',
    price: 3999,
    priceDisplay: '3,999',
    featured: false,
    ctaLabel: 'GO ELITE',
    goalValue: 'Elite Membership (₹3,999/month)',
    features: [
      { text: 'Everything included in Pro', included: true },
      { text: '4 private 1-on-1 PT sessions per month', included: true },
      { text: 'Custom nutrition & meet-prep protocol', included: true },
      { text: 'Dedicated private locker & kit laundry', included: true },
      { text: 'Bi-weekly coach check-in & form audit', included: true },
    ],
  },
];

export const TRAINERS: TrainerItem[] = [
  {
    id: 'marcus-reyes',
    name: 'MARCUS REYES',
    role: 'HEAD OF POWERLIFTING',
    credential: '340 KG DL',
    bio: 'IPF national medallist specialising in raw squat, bench and deadlift peaking cycles.',
    image: '/src/assets/images/trainer_marcus_1795503441559.webp',
    imageAlt: 'Studio portrait of Marcus Reyes, Head of Powerlifting at Ironforge Fitness',
  },
  {
    id: 'elena-volkova',
    name: 'ELENA VOLKOVA',
    role: 'STRENGTH & CONDITIONING',
    credential: 'CSCS',
    bio: 'Former track athlete focused on barbell mechanics, explosive power and injury resilience.',
    image: '/src/assets/images/trainer_elena_1795503441938.webp',
    imageAlt: 'Studio portrait of Elena Volkova, Strength and Conditioning Coach at Ironforge Fitness',
  },
  {
    id: 'darius-cole',
    name: 'DARIUS COLE',
    role: 'BODYBUILDING COACH',
    credential: 'IFBB PRO',
    bio: 'Twelve years on the pro stage coaching hypertrophy splits, conditioning and contest prep.',
    image: '/src/assets/images/trainer_darius_1795503441557.webp',
    imageAlt: 'Studio portrait of Darius Cole, IFBB Pro Bodybuilding Coach at Ironforge Fitness',
  },
];

export const CONTACT_LINKS = {
  addressQuery: '418 Foundry Street, Brooklyn, NY 11211',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=418+Foundry+Street+Brooklyn+NY+11211',
  phoneDisplay: '+1 (718) 555-0142',
  phoneHref: 'tel:+17185550142',
  emailDisplay: 'train@ironforge.fit',
  emailHref: 'mailto:train@ironforge.fit',
  instagramHandle: '@ironforge.fit',
  instagramUrl: 'https://www.instagram.com/ironforge.fit/',
};

export const CONTACT_INFO = [
  {
    label: 'ADDRESS',
    lines: ['418 Foundry Street', 'Brooklyn, NY 11211'],
  },
  {
    label: 'HOURS',
    lines: ['Staffed daily, 6am–11pm', 'Members 24/7'],
  },
  {
    label: 'REACH',
    lines: ['+1 (718) 555-0142', 'train@ironforge.fit'],
  },
];

export const KINETIC_RIBBONS = {
  heroToAbout: [
    'IRONFORGE FITNESS',
    '24/7 BIOMETRIC ACCESS',
    '18,000 SQ FT OF IRON',
    '42 COMPETITION RACKS',
    'IPF CALIBRATED STEEL',
    'BROOKLYN · EST. 2012',
  ],
  aboutToPrograms: [
    'BUILT FOR SERIOUS LIFTERS',
    '12+ YEARS STRONG',
    '2,400+ ACTIVE MEMBERS',
    '96 PRO TITLES EARNED',
    'NO EXCUSES · ONLY IRON',
    'PROGRESS EARNED UNDER THE BAR',
  ],
  programsToEquipmentPrimary: [
    'BODYBUILDING',
    'POWERLIFTING',
    'PERSONAL TRAINING',
    'COMPETITION-GRADE IRON',
    'IPF CALIBRATED PLATES',
    'DUMBBELLS TO 80 KG',
    '42 POWER RACKS',
    '12 DEADLIFT PLATFORMS',
  ],
  programsToEquipmentSecondary: [
    'FORGED UNDER HEAVY IRON',
    'CALIBRATED TO ±10 GRAMS',
    '68 PLATE-LOADED STATIONS',
    'MAINTAINED DAILY FOR MAXIMAL LOADS',
    'OAK-CORE DEADLIFT PLATFORMS',
  ],
  equipmentToMembership: [
    'NO JOINING FEES',
    'NO LOCK-IN CONTRACTS',
    '24/7 KEYCARD ACCESS',
    'UPGRADE OR CANCEL ANYTIME',
    'RECOVERY ZONE & SAUNA',
    'PRIORITY RACK BOOKING',
  ],
  membershipToTrainersPrimary: [
    'COACHED BY COMPETITORS',
    'IPF NATIONAL MEDALLISTS',
    'IFBB PRO COACHING',
    'CSCS STRENGTH SPECIALISTS',
    'BI-WEEKLY FORM AUDITS',
    'MEET-PREP PEAKING',
  ],
  membershipToTrainersSecondary: [
    'MARCUS REYES · 340 KG DL',
    'ELENA VOLKOVA · CSCS',
    'DARIUS COLE · IFBB PRO',
    '1-ON-1 PRIVATE COACHING',
    'TECHNIQUE & PEAKING AUDITS',
  ],
  trainersToContact: [
    'BOOK A FREE GYM TOUR',
    'FIRST SESSION ON US',
    '418 FOUNDRY STREET · BROOKLYN',
    'STAFFED DAILY 6AM–11PM',
    'REPLY WITHIN 24 HOURS',
    'WALK THE FLOOR',
  ],
} as const;
