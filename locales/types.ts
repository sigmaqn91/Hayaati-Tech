export type SupportedLanguage =
  | 'en' | 'hi' | 'bn' | 'ur' | 'ar'
  | 'pa' | 'mr' | 'gu' | 'ta' | 'te'
  | 'kn' | 'ml' | 'ne' | 'vi' | 'fr'
  | 'de' | 'es' | 'pt' | 'it' | 'zh'
  | 'ja' | 'ko' | 'ru' | 'tr' | 'id';

export interface TranslationSchema {
  meta: {
    code: SupportedLanguage;
    languageName: string;
    nativeName: string;
    rtl: boolean;
  };
  nav: {
    home: string;
    timeline: string;
    tech: string;
    places: string;
    projects: string;
    advertise: string;
    about: string;
    contact: string;
    assistant: string;
    language: string;
    menu: string;
    close: string;
    brandSubtitle: string;
    menuSysHeader: string;
    locationDomain: string;
  };
  hero: {
    systemStatus: string;
    online: string;
    headline: string;
    subtitle: string;
    exploreCta: string;
    projectsCta: string;
    coordinates: string;
    timelineSpan: string;
    liveTelemetry: string;
    scrollDown: string;
    imageAlt: string;
  };
  timeline: {
    sectionTag: string;
    title: string;
    subtitle: string;
    chronoMap: string;
    eraHeading: string;
    storyTitle: string;
    breakthroughsTitle: string;
    viewEraDetails: string;
    jumpToEra: string;
    statusPrefix: string;
    eraBreakthroughsHeading: string;
    specificationsCount: string;
  };
  tech: {
    sectionTag: string;
    title: string;
    subtitle: string;
    systemsIndex: string;
    howItWorksLabel: string;
    architectureMechanics: string;
    underlyingMechanism: string;
    searchPlaceholder: string;
    searchNoResults: string;
    filterAll: string;
    modalClose: string;
    viewDossier: string;
    yearLabel: string;
    statusLabel: string;
    activeStatus: string;
    promptLabel: string;
    categories: {
      all: string;
      ai: string;
      vehicles: string;
      devices: string;
      homeWork: string;
      health: string;
      energy: string;
      space: string;
    };
  };
  places: {
    sectionTag: string;
    title: string;
    subtitle: string;
    horizonLabel: string;
    aDayInPlace: string;
    infrastructureLabel: string;
    viewLocation: string;
    promptLabel: string;
  };
  projects: {
    sectionTag: string;
    title: string;
    subtitle: string;
    tabs: {
      live: string;
      inProgress: string;
      futureIdeas: string;
    };
    visit: string;
    emptyLive: string;
    emptyInProgress: string;
    emptyIdeas: string;
    pendingNotice: string;
  };
  advertise: {
    sectionTag: string;
    title: string;
    subtitle: string;
    reviewNotice: string;
    pricingNote: string;
    form: {
      name: string;
      email: string;
      projectName: string;
      projectLink: string;
      category: string;
      selectCategory: string;
      budget: string;
      budgetPlaceholder: string;
      description: string;
      submitBtn: string;
      sending: string;
      sentSuccess: string;
      sendError: string;
    };
  };
  about: {
    sectionTag: string;
    title: string;
    subtitle: string;
    ownerName: string;
    architectTitle: string;
    leadArchitect: string;
    bioPlaceholder: string;
    contactDirect: string;
    photoAlt: string;
  };
  contact: {
    sectionTag: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    directEmail: string;
    form: {
      name: string;
      email: string;
      message: string;
      submitBtn: string;
      sending: string;
      sentSuccess: string;
      sendError: string;
      placeholderName: string;
      placeholderEmail: string;
      placeholderMessage: string;
    };
  };
  assistant: {
    buttonLabel: string;
    panelTitle: string;
    subtitle: string;
    welcomeMessage: string;
    chips: [string, string, string];
    inputPlaceholder: string;
    sendBtn: string;
    retryBtn: string;
    voiceBtn: string;
    voiceStopBtn: string;
    voiceListening: string;
    voiceSpeaking: string;
    voiceConnecting: string;
    voiceUnsupported: string;
    voiceNotAvailableLang: string;
    rateLimitBanner: string;
    talkTo: string;
    typeInstead: string;
    returnToOrb: string;
    muteMic: string;
    unmuteMic: string;
    micLabel: string;
    mutedLabel: string;
    endSession: string;
    endLabel: string;
    userTag: string;
    assistantTag: string;
    cognitiveLink: string;
    orb: {
      ready: string;
      listening: string;
      thinking: string;
      speaking: string;
      tapToStart: string;
      start: string;
    };
    errors: {
      quotaReached: string;
      serverBusy: string;
      networkError: string;
      micBlocked: string;
      sessionEnded: string;
      genericError: string;
    };
  };
  footer: {
    copyright: string;
    disclaimer: string;
    liveDomainLabel: string;
    quickLinks: string;
    systemDesignation: string;
    allRightsReserved: string;
  };
  common: {
    year: string;
    status: string;
    operational: string;
    close: string;
    back: string;
    retry: string;
    error: string;
    success: string;
    loading: string;
  };
  languageSelector: {
    selectLanguage: string;
    dialogTitle: string;
    searchPlaceholder: string;
    languagesCountSuffix: string;
  };
  imageSlot: {
    opticalChannel: string;
    framePending: string;
    sysDim: string;
  };
  notFound: {
    errorTag: string;
    title: string;
    description: string;
    returnBtn: string;
  };
}

export interface EraContent {
  title: string;
  yearLabel: string;
  story: string;
  breakthroughs: string[];
  bannerAlt: string;
  bannerPrompt: string;
}

export interface TimelineCardContent {
  title: string;
  description: string;
  breakthrough: string;
  alt: string;
  prompt: string;
}

export interface TechCardContent {
  title: string;
  description: string;
  howItWorks: string;
  alt: string;
  prompt: string;
}

export interface PlaceContent {
  title: string;
  location: string;
  story: string;
  infrastructureTags: string[];
  alt: string;
  prompt: string;
}

export interface ContentSchema {
  eras: Record<string, EraContent>;
  timelineCards: Record<string, TimelineCardContent>;
  techCards: Record<string, TechCardContent>;
  places: Record<string, PlaceContent>;
  projects: {
    pendingNotice: string;
    emptyLive: string;
    emptyInProgress: string;
    emptyIdeas: string;
  };
}

export interface LanguageBundle {
  ui: TranslationSchema;
  content: ContentSchema;
}
