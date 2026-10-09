export type ProjectArtKey =
  | 'mehendi'
  | 'web-studio'
  | 'technology'
  | 'bridge'
  | 'quantum'
  | 'orbit';

export interface ProjectItemData {
  id: string;
  status: 'live' | 'in-progress' | 'future-idea';
  techTags: string[];
  url?: string;
  screenshot?: string;
  /** Card title shown below the banner */
  title?: string;
  /** Short description shown on the card */
  description?: string;
  /** Which animated banner to draw */
  art?: ProjectArtKey;
  /** Text drawn on top of the banner */
  banner?: {
    line1: string;
    line2: string;
    tagline: string;
    style: 'serif' | 'sans';
  };
}

export const projectsData: ProjectItemData[] = [
  // ───────────── LIVE ─────────────
  {
    id: 'hayaati-mehendi-studio',
    status: 'live',
    title: 'Hayaati Mehendi Studio',
    description:
      'A boutique mehendi studio website for brides, celebrations and everyday designs. Browse the collection and send your enquiry.',
    techTags: ['Website Design', 'Blogger', 'Responsive UI'],
    url: 'https://hayatimahendi.blogspot.com/?m=1',
    art: 'mehendi',
    banner: {
      line1: 'Hayaati',
      line2: 'Mehendi Studio',
      tagline: 'Bridal henna artistry, drawn with care.',
      style: 'serif',
    },
  },

  // ─────────── IN DEVELOPMENT (upcoming) ───────────
  {
    id: 'hayaati-web-studio',
    status: 'in-progress',
    title: 'Hayaati Web Studio',
    description:
      'Custom website development, UI/UX design and digital solutions for businesses and creators.',
    techTags: ['Web Development', 'Next.js', 'React'],
    art: 'web-studio',
    banner: {
      line1: 'Hayaati',
      line2: 'Web Studio',
      tagline: 'Modern websites for a smarter future.',
      style: 'sans',
    },
  },
  {
    id: 'hayaati-technology',
    status: 'in-progress',
    title: 'Hayaati Technology',
    description:
      'Main platform for future services, AI tools and global technology solutions.',
    techTags: ['Platform', 'Next.js', 'AI Systems'],
    art: 'technology',
    banner: {
      line1: 'Hayaati',
      line2: 'Technology',
      tagline: 'Innovating for a better and smarter tomorrow.',
      style: 'sans',
    },
  },

  // ─────────── HORIZON CONCEPTS (upcoming) ───────────
  {
    id: 'the-bridge-for-one',
    status: 'future-idea',
    title: 'The Bridge for One',
    description:
      'Cinematic short project exploring human connection, technology and a better future.',
    techTags: ['Cinematic', 'Video Project', 'AI'],
    art: 'bridge',
    banner: {
      line1: 'The Bridge',
      line2: 'for One',
      tagline: 'A short cinematic story by Aliya Khan.',
      style: 'serif',
    },
  },
  {
    id: 'hayaati-quantum-lab',
    status: 'future-idea',
    title: 'Hayaati Quantum Lab',
    description:
      'Research concept for quantum-ready computing, simulation tools and next-generation data security.',
    techTags: ['Quantum Computing', 'Research', 'Security'],
    art: 'quantum',
    banner: {
      line1: 'Hayaati',
      line2: 'Quantum Lab',
      tagline: 'Computing beyond the limits of today.',
      style: 'sans',
    },
  },
  {
    id: 'hayaati-orbit',
    status: 'future-idea',
    title: 'Hayaati Orbit',
    description:
      'Satellite-connected network concept for fast, global internet and smart city communication.',
    techTags: ['Space Tech', 'Satellite Network', 'IoT'],
    art: 'orbit',
    banner: {
      line1: 'Hayaati',
      line2: 'Orbit',
      tagline: 'Connecting every corner of the planet.',
      style: 'sans',
    },
  },
];
