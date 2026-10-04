import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hayaati Web Technology',
    short_name: 'Hayaati',
    description:
      'A cinematic blueprint of human innovation, cognitive machines, orbital colonies, and sustainable habitats across 2030–2050. Built by Aliya Khan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05070a',
    theme_color: '#05070a',
    icons: [
      {
        src: '/images/hero/hero-main.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: '/images/hero/hero-main.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  };
}
