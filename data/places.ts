export interface PlaceCardData {
  id: string;
  year: number;
  image: string;
}

export const placesData: PlaceCardData[] = [
  { id: 'place-1', year: 2030, image: '/images/places/smart-street-2030.webp' },
  { id: 'place-2', year: 2035, image: '/images/places/vertical-city-2035.webp' },
  { id: 'place-3', year: 2038, image: '/images/places/floating-city-2038.webp' },
  { id: 'place-4', year: 2042, image: '/images/places/desert-solar-2042.webp' },
  { id: 'place-5', year: 2045, image: '/images/places/moon-base-2045.webp' },
  { id: 'place-6', year: 2050, image: '/images/places/mars-colony-2050.webp' },
  { id: 'place-7', year: 2036, image: '/images/places/rotterdam-port-2036.webp' },
  { id: 'place-8', year: 2048, image: '/images/places/orbital-ring-2048.webp' },
];
