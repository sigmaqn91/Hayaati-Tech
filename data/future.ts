export type EraYear = '2030' | '2035' | '2040' | '2045' | '2050';

export interface TimelineCardData {
  id: string;
  era: '2030' | '2035' | '2050';
  year: number;
  image: string;
}

export interface TimelineEraData {
  id: string;
  era: '2030' | '2035' | '2050';
  year: number;
  bannerImage: string;
  cards: TimelineCardData[];
}

export interface TechCardData {
  id: string;
  category: 'ai' | 'vehicles' | 'devices' | 'homeWork' | 'health' | 'energy' | 'space';
  era: EraYear;
  year: number;
  image: string;
}

export const timelineEras: TimelineEraData[] = [
  {
    id: 'era-2030',
    era: '2030',
    year: 2030,
    bannerImage: '/images/eras/era-2030-banner.webp',
    cards: [
      {
        id: 'tl-2030-1',
        era: '2030',
        year: 2030,
        image: '/images/vehicles/urban-sky-taxi.webp',
      },
      {
        id: 'tl-2030-2',
        era: '2030',
        year: 2030,
        image: '/images/ai/personal-companion.webp',
      },
      {
        id: 'tl-2030-3',
        era: '2030',
        year: 2030,
        image: '/images/energy/solid-state-grid.webp',
      },
      {
        id: 'tl-2030-4',
        era: '2030',
        year: 2030,
        image: '/images/home-work/adaptive-glass.webp',
      },
    ],
  },
  {
    id: 'era-2035',
    era: '2035',
    year: 2035,
    bannerImage: '/images/eras/era-2035-banner.webp',
    cards: [
      {
        id: 'tl-2035-1',
        era: '2035',
        year: 2035,
        image: '/images/devices/neural-link.webp',
      },
      {
        id: 'tl-2035-2',
        era: '2035',
        year: 2035,
        image: '/images/health/mobile-med-pod.webp',
      },
      {
        id: 'tl-2035-3',
        era: '2035',
        year: 2035,
        image: '/images/home-work/mycelium-modules.webp',
      },
      {
        id: 'tl-2035-4',
        era: '2035',
        year: 2035,
        image: '/images/vehicles/maglev-tube.webp',
      },
    ],
  },
  {
    id: 'era-2050',
    era: '2050',
    year: 2050,
    bannerImage: '/images/eras/era-2050-banner.webp',
    cards: [
      {
        id: 'tl-2050-1',
        era: '2050',
        year: 2050,
        image: '/images/energy/fusion-reactor.webp',
      },
      {
        id: 'tl-2050-2',
        era: '2050',
        year: 2050,
        image: '/images/space/lunar-harvester.webp',
      },
      {
        id: 'tl-2050-3',
        era: '2050',
        year: 2050,
        image: '/images/energy/ocean-carbon-scrubber.webp',
      },
      {
        id: 'tl-2050-4',
        era: '2050',
        year: 2050,
        image: '/images/space/orbital-habitat.webp',
      },
    ],
  },
];

export const techCatalogue: TechCardData[] = [
  // Future AI
  { id: 'tech-ai-1', category: 'ai', era: '2030', year: 2030, image: '/images/ai/personal-companion.webp' },
  { id: 'tech-ai-2', category: 'ai', era: '2035', year: 2035, image: '/images/ai/consensus-engine.webp' },
  { id: 'tech-ai-3', category: 'ai', era: '2035', year: 2035, image: '/images/ai/science-agent.webp' },
  { id: 'tech-ai-4', category: 'ai', era: '2040', year: 2040, image: '/images/ai/ecology-restorer.webp' },
  { id: 'tech-ai-5', category: 'ai', era: '2030', year: 2030, image: '/images/ai/realtime-translator.webp' },
  { id: 'tech-ai-6', category: 'ai', era: '2050', year: 2050, image: '/images/ai/climate-simulator.webp' },

  // Vehicles & Transit
  { id: 'tech-veh-1', category: 'vehicles', era: '2030', year: 2030, image: '/images/vehicles/urban-sky-taxi.webp' },
  { id: 'tech-veh-2', category: 'vehicles', era: '2035', year: 2035, image: '/images/vehicles/maglev-tube.webp' },
  { id: 'tech-veh-3', category: 'vehicles', era: '2030', year: 2030, image: '/images/vehicles/cargo-shuttle.webp' },
  { id: 'tech-veh-4', category: 'vehicles', era: '2035', year: 2035, image: '/images/vehicles/hydrogen-hydrofoil.webp' },
  { id: 'tech-veh-5', category: 'vehicles', era: '2040', year: 2040, image: '/images/vehicles/strato-glider.webp' },
  { id: 'tech-veh-6', category: 'vehicles', era: '2050', year: 2050, image: '/images/vehicles/heavy-lifter.webp' },

  // Devices & Bionics
  { id: 'tech-dev-1', category: 'devices', era: '2035', year: 2035, image: '/images/devices/neural-link.webp' },
  { id: 'tech-dev-2', category: 'devices', era: '2030', year: 2030, image: '/images/devices/corneal-display.webp' },
  { id: 'tech-dev-3', category: 'devices', era: '2035', year: 2035, image: '/images/devices/bio-exosuit.webp' },
  { id: 'tech-dev-4', category: 'devices', era: '2035', year: 2035, image: '/images/devices/haptic-holo.webp' },
  { id: 'tech-dev-5', category: 'devices', era: '2030', year: 2030, image: '/images/devices/graphene-battery.webp' },
  { id: 'tech-dev-6', category: 'devices', era: '2040', year: 2040, image: '/images/devices/bionic-retina.webp' },

  // Home & Workplace
  { id: 'tech-home-1', category: 'homeWork', era: '2030', year: 2030, image: '/images/home-work/adaptive-glass.webp' },
  { id: 'tech-home-2', category: 'homeWork', era: '2035', year: 2035, image: '/images/home-work/mycelium-modules.webp' },
  { id: 'tech-home-3', category: 'homeWork', era: '2030', year: 2030, image: '/images/home-work/water-cycler.webp' },
  { id: 'tech-home-4', category: 'homeWork', era: '2030', year: 2030, image: '/images/home-work/aeroponic-wall.webp' },
  { id: 'tech-home-5', category: 'homeWork', era: '2035', year: 2035, image: '/images/home-work/acoustic-field.webp' },
  { id: 'tech-home-6', category: 'homeWork', era: '2035', year: 2035, image: '/images/home-work/kinetic-floors.webp' },

  // Health & Biology
  { id: 'tech-hlth-1', category: 'health', era: '2035', year: 2035, image: '/images/health/mobile-med-pod.webp' },
  { id: 'tech-hlth-2', category: 'health', era: '2035', year: 2035, image: '/images/health/mrna-rejuvenator.webp' },
  { id: 'tech-hlth-3', category: 'health', era: '2040', year: 2040, image: '/images/health/bioprinted-organ.webp' },
  { id: 'tech-hlth-4', category: 'health', era: '2030', year: 2030, image: '/images/health/metabolic-sensor.webp' },
  { id: 'tech-hlth-5', category: 'health', era: '2035', year: 2035, image: '/images/health/microbiome-synth.webp' },
  { id: 'tech-hlth-6', category: 'health', era: '2040', year: 2040, image: '/images/health/ultrasound-oncology.webp' },

  // Energy & Climate
  { id: 'tech-nrg-1', category: 'energy', era: '2050', year: 2050, image: '/images/energy/fusion-reactor.webp' },
  { id: 'tech-nrg-2', category: 'energy', era: '2030', year: 2030, image: '/images/energy/solid-state-grid.webp' },
  { id: 'tech-nrg-3', category: 'energy', era: '2050', year: 2050, image: '/images/energy/ocean-carbon-scrubber.webp' },
  { id: 'tech-nrg-4', category: 'energy', era: '2030', year: 2030, image: '/images/energy/tandem-solar.webp' },
  { id: 'tech-nrg-5', category: 'energy', era: '2040', year: 2040, image: '/images/energy/superhot-geothermal.webp' },
  { id: 'tech-nrg-6', category: 'energy', era: '2035', year: 2035, image: '/images/energy/fog-tower.webp' },

  // Deep Space
  { id: 'tech-spc-1', category: 'space', era: '2050', year: 2050, image: '/images/space/lunar-harvester.webp' },
  { id: 'tech-spc-2', category: 'space', era: '2050', year: 2050, image: '/images/space/orbital-habitat.webp' },
  { id: 'tech-spc-3', category: 'space', era: '2040', year: 2040, image: '/images/space/ion-tug.webp' },
  { id: 'tech-spc-4', category: 'space', era: '2040', year: 2040, image: '/images/space/regolith-printer.webp' },
  { id: 'tech-spc-5', category: 'space', era: '2045', year: 2045, image: '/images/space/nuclear-rocket.webp' },
  { id: 'tech-spc-6', category: 'space', era: '2050', year: 2050, image: '/images/space/asteroid-deflector.webp' },
];
