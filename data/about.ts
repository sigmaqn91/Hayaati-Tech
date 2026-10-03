/**
 * HAYAATI WEB TECHNOLOGY — ABOUT DATA
 * Note per Master Specification (Section 0 & 3):
 * "Owner: Aliya Khan
 * Site name: Hayaati Web Technology
 * Contact email: Hayaati.Technology@gmail.com
 * Live domain: www.hayaatiweb.site
 * Projects, About text, social links, owner photo: NOT supplied yet. Keep them in editable data files.
 * If empty, show an honest 'coming soon' state. Never invent projects, bio, testimonials, counters or links.
 * Optional owner photo slot (About area only), replaceable; never generate or fake a photo of her."
 */

export interface AboutData {
  ownerName: string;
  role: string;
  email: string;
  domain: string;
  photoUrl: string | null; // Leave null until Aliya provides real photo
  bio: string | null; // Leave null until Aliya provides bio
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
}

export const aboutData: AboutData = {
  ownerName: 'Aliya Khan',
  role: 'Founder & Architect, Hayaati Web Technology',
  email: 'Hayaati.Technology@gmail.com',
  domain: 'www.hayaatiweb.site',
  photoUrl: null, // Set to '/images/about/aliya-khan.webp' once supplied by Aliya
  bio: null, // Set to Aliya's real bio once supplied
  socialLinks: [], // Add real links once supplied by Aliya
};
