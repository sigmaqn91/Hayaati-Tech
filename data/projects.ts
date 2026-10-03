export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  status: 'live' | 'in-progress' | 'future-idea';
  techTags: string[];
  url?: string;
  screenshot?: string;
  description?: string;
}

/**
 * HAYAATI WEB TECHNOLOGY — PROJECTS DATA
 * Note per Master Specification (Section 0 & 3):
 * "Projects, About text, social links, owner photo: NOT supplied yet. Keep them in editable data files.
 * If empty, show an honest 'coming soon' state. Never invent projects, bio, testimonials, counters or links.
 * Real Hayaati project images/screenshots come ONLY from files supplied by Aliya. Never generate or fake a project image."
 *
 * Aliya Khan can add her real projects directly into this array.
 */
export const projectsData: ProjectItem[] = [
  // When Aliya provides her real projects, add them here:
  // Example structure:
  // {
  //   id: 'project-1',
  //   name: 'Project Title',
  //   tagline: 'One sentence summary of the project.',
  //   status: 'live',
  //   techTags: ['Next.js', 'TypeScript', 'Tailwind'],
  //   url: 'https://example.com',
  //   description: 'Full project description.'
  // }
];
