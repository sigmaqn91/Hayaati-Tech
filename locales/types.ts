export interface TranslationSchema {
  meta: {
    code: string;
    languageName: string;
    nativeName: string;
    rtl: boolean;
    humanReviewRequired: boolean;
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
  };
  timeline: {
    sectionTag: string;
    title: string;
    subtitle: string;
    storyTitle: string;
    breakthroughsTitle: string;
  };
  tech: {
    sectionTag: string;
    title: string;
    subtitle: string;
    howItWorksLabel: string;
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
    aDayInPlace: string;
    infrastructure: string;
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
      budget: string;
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
    bioPlaceholder: string;
    contactDirect: string;
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
    };
  };
  assistant: {
    buttonLabel: string;
    panelTitle: string;
    welcomeMessage: string;
    inputPlaceholder: string;
    sendBtn: string;
    voiceBtn: string;
    voiceStopBtn: string;
    voiceListening: string;
    voiceSpeaking: string;
    quotaWarning: string;
    micDeniedWarning: string;
    notSupportedWarning: string;
    rateLimitWarning: string;
  };
  footer: {
    copyright: string;
    disclaimer: string;
    liveDomainLabel: string;
    quickLinks: string;
    systemDesignation: string;
  };
}

export type SupportedLanguage =
  | 'en' | 'hi' | 'bn' | 'ur' | 'ar'
  | 'pa' | 'mr' | 'gu' | 'ta' | 'te'
  | 'kn' | 'ml' | 'ne' | 'fr' | 'de'
  | 'es' | 'pt' | 'it' | 'zh' | 'ja'
  | 'ko' | 'ru' | 'tr' | 'id';
