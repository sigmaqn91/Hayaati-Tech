export interface AboutConfig {
  ownerName: string;
  email: string;
  domain: string;
  photoUrl: string | null;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
}

export const aboutData: AboutConfig = {
  ownerName: 'Aliya Khan',
  email: 'Hayaati.Technology@gmail.com',
  domain: 'www.hayaatiweb.site',
  photoUrl: null,
  socialLinks: [],
};
