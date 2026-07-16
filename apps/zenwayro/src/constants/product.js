export const APP_SHELL_ROOT_CLASSES =
  'zenwayro-v2-ui flex flex-col flex-1 min-h-0 h-full min-h-screen bg-background text-foreground';
export const APP_SHELL_HEADER_CLASSES = 'shrink-0 z-40';
export const APP_SHELL_MAIN_CLASSES =
  'flex-1 min-h-0 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.75rem)]';
export const APP_SHELL_FOOTER_CLASSES = 'shrink-0';

export const APP_NAVBAR_ROOT_CLASSES =
  'sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-white/95 px-4 backdrop-blur-md md:px-6';

export const EUROPE_MAP_CENTER = [10, 50];
export const EUROPE_MAP_ZOOM = 4;
export const CITY_MAP_ZOOM = 13;

export const HOME_HERO_IMAGE = '/images/home_bg.webp';

export const HOME_QUIZ_STYLE_TAG_KEYS = [
  'home.quizTagFoodie',
  'home.quizTagCulture',
  'home.quizTagAdventure',
  'home.quizTagRelaxed',
];

export const HOME_PLAN_STYLE_TAG_KEYS = [
  'home.planTagWalking',
  'home.planTagDayByDay',
  'home.planTagLocal',
  'home.planTagShare',
];

export const HOME_LANDING_FEATURES = [
  {
    iconKey: 'plan',
    titleKey: 'home.landingFeaturePlanTitle',
    descKey: 'home.landingFeaturePlanDesc',
    iconClass: 'bg-[#0f1b3d]',
  },
  {
    iconKey: 'explore',
    titleKey: 'home.landingFeatureExploreTitle',
    descKey: 'home.landingFeatureExploreDesc',
    iconClass: 'bg-[#1e3a5f]',
  },
  {
    iconKey: 'share',
    titleKey: 'home.landingFeatureShareTitle',
    descKey: 'home.landingFeatureShareDesc',
    iconClass: 'coral-gradient',
  },
];

export const INTERESTS = [
  'museums',
  'nature',
  'food',
  'nightlife',
  'architecture',
  'art',
  'history',
  'shopping',
];

export const INTEREST_KEYS = {
  museums: 'quiz.interestMuseums',
  nature: 'quiz.interestNature',
  food: 'quiz.interestFood',
  nightlife: 'quiz.interestNightlife',
  architecture: 'quiz.interestArchitecture',
  art: 'quiz.interestArt',
  history: 'quiz.interestHistory',
  shopping: 'quiz.interestShopping',
};

export const VIBES = [
  { id: 'relaxed', labelKey: 'quiz.vibeRelaxed' },
  { id: 'market', labelKey: 'quiz.vibeMarket' },
  { id: 'park', labelKey: 'quiz.vibePark' },
  { id: 'bar', labelKey: 'quiz.vibeBar' },
];

export const BUDGET_OPTIONS = [
  { value: 'free', labelKey: 'quiz.budgetFree' },
  { value: 'moderate', labelKey: 'quiz.budgetModerate' },
  { value: 'any', labelKey: 'quiz.budgetNoLimit' },
];

export const DURATION_OPTIONS = [
  { labelKey: 'quiz.halfDay', value: 0.5 },
  { labelKey: 'quiz.fullDay', value: 1 },
  { labelKey: 'quiz.twoDays', value: 3 },
  { labelKey: 'quiz.fourDays', value: 7 },
];

export const QUIZ_TOTAL_STEPS = 5;
