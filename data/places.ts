export interface PlaceCard {
  id: string;
  year: number;
  location: string;
  title: string;
  image: string;
  alt: string;
  imagePrompt: string;
  story: string;
  infrastructureTags: string[];
}

export const placesData: PlaceCard[] = [
  {
    id: 'place-1',
    year: 2030,
    location: 'Neo-Songdo Peninsula, South Korea',
    title: 'Kinetic Smart Street Corridor',
    image: '/images/places/smart-street-2030.webp',
    alt: 'Urban pedestrian boulevard in 2030 with subterranean delivery portals and electric transit shuttles',
    imagePrompt: 'High-end architectural photograph of a futuristic pedestrian street in Neo-Songdo at twilight, smart lampposts with subtle cyan indicator rings, silent low-speed autonomous public shuttles, lush rain gardens, clean stone pavement reflecting shop lights, photorealistic urban realism, 8k resolution, no text, no logos, no watermark.',
    story: 'Pedestrians stroll along curbless bio-permeable stone avenues where pneumatic subterranean delivery tubes deposit goods straight to basement hubs, leaving the surface calm, green, and completely free of combustion vehicles.',
    infrastructureTags: ['Pneumatic Freight Micro-Tunnels', 'Curbless Permeable Paving', 'Dynamic Autonomous Shuttles', 'IoT Microclimate Misting']
  },
  {
    id: 'place-2',
    year: 2035,
    location: 'Marina Vertical Spire, Singapore',
    title: 'The Vertical Eco-Spire',
    image: '/images/places/vertical-city-2035.webp',
    alt: 'One-kilometer-high vertical city spire with cascading sky-parks and aeroponic terraces',
    imagePrompt: 'Cinematic wide-angle architectural photograph looking up at a towering 800-meter sustainable vertical city tower in Singapore, cascading greenery on sky-gardens, magnetic elevator tubes climbing the exterior, warm tropical golden hour sunlight, photorealistic architecture, 8k resolution, no text, no logos, no watermark.',
    story: 'A self-contained one-kilometer spire where eighty thousand residents live, work, and harvest produce across eighty terraced aeroponic sky-gardens, stepping between climate-moderated indoor biomes without ever setting foot on surface asphalt.',
    infrastructureTags: ['Multi-Directional Maglev Elevators', 'Integrated Aeroponic Sky-Farms', 'Rainwater Micro-Hydropower', 'Passive Convective Cooling Atriums']
  },
  {
    id: 'place-3',
    year: 2038,
    location: 'Equatorial Pacific Ocean, French Polynesia',
    title: 'Polynesian Floating Ocean Habitat',
    image: '/images/places/floating-city-2038.webp',
    alt: 'Modular floating ocean city platform with solar wave-breakers and marine research lagoons',
    imagePrompt: 'Stunning aerial maritime photograph of a modular floating hexagonal city platform in the calm tropical ocean, white composite buildings with solar canopies, clear turquoise lagoons between modules, distant solar-wind catamarans, photorealistic, 8k resolution, no text, no logos, no watermark.',
    story: 'Engineered upon modular submerged buoyant caissons that absorb ocean swells, this maritime community generates its own electricity from temperature differentials and extracts potable water directly from deep ocean currents.',
    infrastructureTags: ['OTEC Deep Ocean Thermal Power', 'Submerged Swell-Damping Caissons', 'Desalination Flash Evaporators', 'Regenerative Kelp Aquaculture Lattices']
  },
  {
    id: 'place-4',
    year: 2042,
    location: 'Rub\' al Khali Desert, Arabian Peninsula',
    title: 'The Desert Solar Arcology',
    image: '/images/places/desert-solar-2042.webp',
    alt: 'Futuristic solar-powered desert settlement with parabolic solar collector fields and shaded canyons',
    imagePrompt: 'Cinematic wide landscape photograph of a futuristic solar arcology in the golden desert dunes, aerodynamic shaded canopy buildings, vast circular parabolic solar thermal mirror fields in the background, heat shimmer, late afternoon sun, 8k resolution, photorealistic, no text, no logos, no watermark.',
    story: 'Surrounded by sweeping golden dunes, the arcology channels cool subterranean air through traditional biomimetic wind towers while powering heavy manufacturing with acres of molten-salt concentrated solar arrays.',
    infrastructureTags: ['Molten-Salt Thermal Energy Storage', 'Biomimetic Wind Catcher Towers', 'Atmospheric Condensation Canopies', 'Deep Saline Aquifer Desalination']
  },
  {
    id: 'place-5',
    year: 2045,
    location: 'Shackleton Crater Rim, Lunar South Pole',
    title: 'Artemis Base Camp // Shackleton Station',
    image: '/images/places/moon-base-2045.webp',
    alt: 'Permanent lunar habitat modules tucked beneath a protective sintered regolith berm near a crater rim',
    imagePrompt: 'Cinematic photograph of a permanent human base on the rim of Shackleton Crater at the Moon south pole, thick 3D-printed regolith berms covering modular habitat domes, autonomous rover rolling nearby, harsh sharp lunar contrast with Earth high above in the starry sky, photorealistic, 8k resolution, no text, no logos, no watermark.',
    story: 'Crews operate on permanent solar power atop the crater rim peaks of eternal light, descending into pitch-black interior craters to mine ancient volatile water ice that fuels outbound voyages across the solar system.',
    infrastructureTags: ['Continuous Solar Ridge Towers', 'Microwave Regolith Sintering Vaults', 'Cryogenic Ice Extraction Melters', 'Closed-Loop ECLSS Ecosystems']
  },
  {
    id: 'place-6',
    year: 2050,
    location: 'Jezero Basin, Mars',
    title: 'Ares Deep Frontier Settlement',
    image: '/images/places/mars-colony-2050.webp',
    alt: 'Pressurized geodesic biodomes and brick habitats nestled inside a Martian volcanic canyon',
    imagePrompt: 'Cinematic planetary landscape photograph of a human research outpost on the red surface of Mars, geodesic transparent greenhouse domes, volcanic basalt habitats, rugged all-terrain exploration rovers, faint butterscotch sky with distant sun, photorealistic concept still, 8k resolution, no text, no logos, no watermark.',
    story: 'Colonists tend rows of genetically fortified legumes beneath double-layered pressurized fluoropolymer domes, while atmospheric Sabatier reactors continuously synthesize rocket propellant from the Martian carbon-dioxide air.',
    infrastructureTags: ['In-Situ Sabatier Methane Reactors', 'Subterranean Basalt Lava Tube Vaults', 'Pressurized Fluoropolymer Geodesics', 'Perchlorate-Remediated Hydroponics']
  },
  {
    id: 'place-7',
    year: 2036,
    location: 'Rotterdam Port Confluence, Netherlands',
    title: 'Autonomous Clean Port Archipelago',
    image: '/images/places/rotterdam-port-2036.webp',
    alt: 'High-tech robotic marine shipping terminal with automated electric cranes and hydrogen container barges',
    imagePrompt: 'Dramatic evening industrial photograph of an automated clean maritime port terminal in Rotterdam, robotic electric gantry cranes loading hydrogen container barges, reflective wet dock concrete, soft sodium-free LED lighting, photorealistic industrial design, 8k resolution, no text, no logos, no watermark.',
    story: 'Silent electric straddle carriers move shipping containers under guidance of millimeter-wave radar networks, while zero-emission hydrogen container barges navigate the North Sea canal corridors without a single human crew member aboard.',
    infrastructureTags: ['Automated Electric Gantry Cranes', 'Liquid Hydrogen Bunkering Jetties', 'Radar Deconfliction Autonomous Fleet', 'Inductive Quayside Vessel Charging']
  },
  {
    id: 'place-8',
    year: 2048,
    location: 'Low Earth Orbit (420 km altitude)',
    title: 'Aura Industrial Orbital Ring Station',
    image: '/images/places/orbital-ring-2048.webp',
    alt: 'Large rotating torus ring space habitat in Earth orbit with solar arrays and docking hubs',
    imagePrompt: 'Cinematic photograph from space of a massive modular rotating wheel space station in low Earth orbit, solar photovoltaic wings capturing bright sunlight, Earth blue atmosphere and continents visible below, commercial cargo capsules docked at the hub, 8k resolution, photorealistic, no text, no logos, no watermark.',
    story: 'Specialists enjoy the comforts of one-third Earth gravity in the outer rotating habitability ring while conducting zero-gravity pharmaceutical crystal growth and semiconductor laser annealing inside the non-rotating central axis.',
    infrastructureTags: ['Rotating Artificial Gravity Torus Ring', 'Non-Rotating Microgravity Industrial Core', 'Magnetically Levitated Air-Bearing Hub', 'Multi-Port Orbital Cargo Airlocks']
  }
];
