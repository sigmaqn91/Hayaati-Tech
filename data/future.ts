export type EraYear = '2030' | '2035' | '2040' | '2045' | '2050';

export interface TimelineCard {
  id: string;
  title: string;
  era: '2030' | '2035' | '2050';
  year: number;
  image: string;
  alt: string;
  imagePrompt: string;
  description: string;
  breakthrough: string;
}

export interface TimelineEra {
  id: string;
  era: '2030' | '2035' | '2050';
  yearLabel: string;
  title: string;
  bannerImage: string;
  bannerAlt: string;
  bannerImagePrompt: string;
  story: string;
  breakthroughs: string[];
  cards: TimelineCard[];
}

export interface TechCard {
  id: string;
  category: 'ai' | 'vehicles' | 'devices' | 'home-work' | 'health' | 'energy' | 'space';
  title: string;
  era: EraYear;
  image: string;
  alt: string;
  imagePrompt: string;
  description: string;
  howItWorks: string;
}

export const timelineEras: TimelineEra[] = [
  {
    id: 'era-2030',
    era: '2030',
    yearLabel: 'ERA // 2030',
    title: 'The Cognitive Foundation',
    bannerImage: '/images/eras/era-2030-banner.webp',
    bannerAlt: 'Cinematic wide view of a 2030 eco-smart metropolis with automated delivery corridors and clean transit',
    bannerImagePrompt: 'Cinematic horizontal wide shot of a 2030 sustainable coastal city at sunrise, glass solar towers, electric ground transit shuttles quietly gliding on dedicated lanes, green vertical gardens, crisp atmospheric realism, photorealistic, natural lighting, ultra-detailed architectural photography, 8k resolution, no text, no logos, no watermark.',
    story: 'Mornings begin with an ambient synthetic intelligence that synchronised energy grids while you slept. The city hums with silent electric conduits and delivery pods weaving through designated subterranean tunnels.',
    breakthroughs: [
      'Edge-computed ambient machine learning assistants without cloud latency',
      'Solid-state lithium-metal battery packs powering 1,000 km municipal transit',
      'Autonomous point-to-point urban sky taxi certification across major corridors'
    ],
    cards: [
      {
        id: 'tl-2030-1',
        title: 'Autonomous Urban Sky Taxi',
        era: '2030',
        year: 2030,
        image: '/images/vehicles/urban-sky-taxi.webp',
        alt: 'Sleek aerodynamic four-passenger eVTOL sky taxi docked at a high-rise rooftop skyport',
        imagePrompt: 'Photorealistic architectural still of a sleek aerodynamic four-passenger electric vertical takeoff aircraft docked on a rooftop skyport at golden hour, polished carbon-titanium fuselage, softly illuminated navigation diodes, cinematic depth of field, natural evening sunlight, ultra-detailed, 8k resolution, no text, no logos, no watermark.',
        description: 'Point-to-point electric vertical takeoff vehicles navigating municipal skyways with redundant acoustic mitigation. Commutes between metropolitan hubs bypass surface gridlock completely.',
        breakthrough: 'Distributed electric propulsion paired with millimeter-wave airspace deconfliction algorithms.'
      },
      {
        id: 'tl-2030-2',
        title: 'Personal AI Companion Node',
        era: '2030',
        year: 2030,
        image: '/images/ai/personal-companion.webp',
        alt: 'Minimalist metallic physical AI companion device resting on a desk with subtle holographic projection',
        imagePrompt: 'Close-up studio product photography of a minimalist matte dark-titanium desktop intelligence node, emitting a faint geometric blue light projection of contextual information, high-end industrial design, tactile materials, natural ambient lighting, 8k resolution, photorealistic, no text, no logos, no watermark.',
        description: 'A dedicated hardware cryptographic enclave running private multi-modal reasoning locally. It manages household scheduling, legal filings, and personal knowledge graphs without third-party surveillance.',
        breakthrough: 'Neuromorphic low-wattage silicon capable of running 500-billion parameter reasoning locally.'
      },
      {
        id: 'tl-2030-3',
        title: 'Next-Gen Solid-State Grid Storage',
        era: '2030',
        year: 2030,
        image: '/images/energy/solid-state-grid.webp',
        alt: 'Massive modular solid-state energy storage units arranged in an arid renewable energy farm',
        imagePrompt: 'Wide cinematic industrial photograph of modern modular solid-state battery energy storage containers integrated into a vast solar-wind desert facility at dusk, clean industrial layout, ambient safety illumination, photorealistic concept photography, 8k resolution, no text, no logos, no watermark.',
        description: 'Non-flammable solid-state electrolyte battery banks capable of stabilizing regional electrical grids during multi-day renewable intermittency. Degrades less than 1% over twenty years.',
        breakthrough: 'Ceramic-polymer composite separators preventing lithium dendrite puncture under high thermal loads.'
      },
      {
        id: 'tl-2030-4',
        title: 'Adaptive Smart Glass Architecture',
        era: '2030',
        year: 2030,
        image: '/images/home-work/adaptive-glass.webp',
        alt: 'Modern skyscraper apartment interior with panoramic windows tinting automatically against harsh sun',
        imagePrompt: 'Interior architectural photograph of a high-rise living space overlooking a skyline, dynamic electrochromic glass tinting softly to control solar glare, minimal sustainable wood and steel furnishings, warm morning sunlight, photorealistic interior design, 8k resolution, no text, no logos, no watermark.',
        description: 'Dynamic photovoltaic glazing that shifts opacity instantaneously while converting incident sunlight into building baseload power. Reduces residential thermal loads by 45%.',
        breakthrough: 'Perovskite-based electrochromic nanocrystals embedded in double-glazed vacuum envelopes.'
      }
    ]
  },
  {
    id: 'era-2035',
    era: '2035',
    yearLabel: 'ERA // 2035',
    title: 'The Biomechanical Synthesis',
    bannerImage: '/images/eras/era-2035-banner.webp',
    bannerAlt: 'Panoramic cinematic visual of a vertical biomechanical city with bio-domes and airborne maglev tracks',
    bannerImagePrompt: 'Cinematic wide horizontal shot of a 2035 vertical city with elevated magnetic transit sky-tubes and cascading aeroponic biodomes, twilight atmosphere, warm interior apartment lights reflecting on damp architectural surfaces, photorealistic concept still, 8k resolution, no text, no logos, no watermark.',
    story: 'Neural telepathic prosthetics allow thoughts to guide digital canvases effortlessly. Healthcare has transitioned from reactive triage to continuous genomic monitoring via microscopic cellular beacons.',
    breakthroughs: [
      'Sub-dermal optoelectronic sensor arrays reading continuous endocrine and metabolic markers',
      'Non-invasive motor cortex decoders restoring voluntary kinetic autonomy to millions',
      'Industrial microbial bioreactors synthesising high-tensile structural building composites'
    ],
    cards: [
      {
        id: 'tl-2035-1',
        title: 'Neural Motor Cortex Link',
        era: '2035',
        year: 2035,
        image: '/images/devices/neural-link.webp',
        alt: 'Ultra-thin biocompatible neural interface patch placed seamlessly behind an ear',
        imagePrompt: 'Detailed macro medical photography of an ultra-thin biocompatible flexible polymer neural patch adhered subtly behind a human ear, delicate microneedle contact points, subtle soft cyan diagnostic indicator, natural skin texture, clinical realism, 8k resolution, no text, no logos, no watermark.',
        description: 'A micron-scale cranial patch that translates intended motor signals into machine instructions with sub-millisecond precision. Eliminates traditional manual touch inputs for technical operators.',
        breakthrough: 'Biocompatible conductive polymers that evade microglial inflammatory immune cascades.'
      },
      {
        id: 'tl-2035-2',
        title: 'Autonomous Mobile Medical Pod',
        era: '2035',
        year: 2035,
        image: '/images/health/mobile-med-pod.webp',
        alt: 'Sleek white autonomous medical vehicle parked in a suburban neighborhood performing diagnostics',
        imagePrompt: 'Exterior photograph of a compact autonomous medical clinic vehicle parked outside a contemporary suburban home, hygienic matte-white carbon composite exterior, clean illuminated biometric scan portal, dawn lighting, realistic street scene, 8k resolution, no text, no logos, no watermark.',
        description: 'Self-driving diagnostic sanctuaries that deploy directly to patients for automated blood chemistry, ultrasound imaging, and on-site pharmacy dispensing within minutes.',
        breakthrough: 'Miniaturised microfluidic spectrometry coupled with automated sterile robotic sample handling.'
      },
      {
        id: 'tl-2035-3',
        title: 'Engineered Mycelium Urban Modules',
        era: '2035',
        year: 2035,
        image: '/images/home-work/mycelium-modules.webp',
        alt: 'Modern architectural building pavilion constructed from organic grown mycelium composite blocks',
        imagePrompt: 'High-end architectural photograph of an avant-garde urban pavilion built from grown structural mycelium composites, warm natural earthy texture combined with geometric precision, evening architectural spotlighting, 8k resolution, photorealistic, no text, no logos, no watermark.',
        description: 'Self-healing architectural building units cultivated from agricultural byproducts and fungal mycelium. They capture carbon during growth and outperform structural timber in thermal insulation.',
        breakthrough: 'Genetically optimised mycelial hyphae producing high-density chitin crosslinks during curing.'
      },
      {
        id: 'tl-2035-4',
        title: 'Autonomous High-Speed Maglev Tube',
        era: '2035',
        year: 2035,
        image: '/images/vehicles/maglev-tube.webp',
        alt: 'Streamlined supersonic maglev train entering a transparent low-pressure elevated vacuum tube',
        imagePrompt: 'Dramatic wide-angle industrial photograph of a streamlined maglev train entering an elevated transparent low-pressure tube spanning across a dramatic valley landscape at sunset, cinematic lighting, motion blur on train, realistic engineering textures, 8k resolution, no text, no logos, no watermark.',
        description: 'Intercity low-pressure capsule transit traversing thousand-kilometer distances in under two hours. Eliminates regional fossil air travel entirely.',
        breakthrough: 'High-temperature superconducting ceramic magnets operating with minimal liquid nitrogen cooling.'
      }
    ]
  },
  {
    id: 'era-2050',
    era: '2050',
    yearLabel: 'ERA // 2050',
    title: 'The Planetary & Orbital Horizon',
    bannerImage: '/images/eras/era-2050-banner.webp',
    bannerAlt: 'Cinematic view of Earth from low planetary orbit showing orbital ring elevators and industrial habitats',
    bannerImagePrompt: 'Cinematic wide film still of Earth from low orbit with an operational carbon-nanotube orbital transfer station in the foreground, faint blue atmospheric curvature, deep black starry space, realistic solar glare on metallic truss structures, 8k resolution, photorealistic concept photography, no text, no logos, no watermark.',
    story: 'Heavy industrial manufacturing has departed Earth’s biosphere for microgravity refineries. On the surface, closed-loop ecosystems and fusion power plants have restored historical oceanic and atmospheric balance.',
    breakthroughs: [
      'Commercial magnetised target fusion reactors feeding continuous multi-gigawatt baseload power',
      'Permanent lunar south-pole resource extraction facilities harvesting volatile water ice',
      'Planetary-scale synthetic biology complexes scrubbing gigatons of historical atmospheric carbon'
    ],
    cards: [
      {
        id: 'tl-2050-1',
        title: 'Commercial Fusion Baseload Reactor',
        era: '2050',
        year: 2050,
        image: '/images/energy/fusion-reactor.webp',
        alt: 'Interior of a massive commercial magnetised fusion tokamak glowing with pale violet magnetic plasma',
        imagePrompt: 'Interior industrial photograph inside an operational nuclear fusion power generation facility, massive magnetic toroidal coils surrounding a central reaction vacuum chamber with soft violet plasma reflection, gleaming stainless steel conduits, photorealistic, 8k resolution, no text, no logos, no watermark.',
        description: 'Net-positive magnetised fusion plants generating continuous emissions-free electricity from deuterium extracted safely from seawater. Supplies clean power to desalination complexes.',
        breakthrough: 'High-field rare-earth barium copper oxide (REBCO) superconducting magnets sustaining stable plasma equilibrium.'
      },
      {
        id: 'tl-2050-2',
        title: 'Lunar South-Pole Water Harvester',
        era: '2050',
        year: 2050,
        image: '/images/space/lunar-harvester.webp',
        alt: 'Rugged autonomous robotic rover mining water ice in the shadowed crater rim of the Moon',
        imagePrompt: 'Cinematic planetary photograph of a rugged heavy-duty autonomous mining rover operating on the jagged rim of a Moon crater, stark harsh lunar sunlight, deep black shadows, fine lunar regolith dust, Earth visible in the dark starry sky above, photorealistic, 8k resolution, no text, no logos, no watermark.',
        description: 'Autonomous extraction rovers operating inside permanently shadowed lunar craters. They vaporise ice deposits to manufacture rocket propellant and drinking reserves for deep-space missions.',
        breakthrough: 'Cryogenic microwave thermal sublimation domes extracting water vapor without bulk excavation.'
      },
      {
        id: 'tl-2050-3',
        title: 'Oceanic Atmospheric Carbon Scrubber',
        era: '2050',
        year: 2050,
        image: '/images/energy/ocean-carbon-scrubber.webp',
        alt: 'Massive floating autonomous marine platform with bio-reactors processing ocean surface waters',
        imagePrompt: 'Wide seascape photograph of an autonomous floating hexagonal ocean facility in the open sea, sleek industrial carbon hull with automated seawater intake arrays and bioreactor tanks, stormy overcast sky, natural water splash physics, photorealistic, 8k resolution, no text, no logos, no watermark.',
        description: 'Hexagonal deep-sea floating refineries that accelerate marine alkalinity and capture dissolved atmospheric carbon dioxide into stable inert calcium bicarbonate minerals.',
        breakthrough: 'Solar-powered electro-dialysis cells that mineralise ocean acidity while outputting green hydrogen.'
      },
      {
        id: 'tl-2050-4',
        title: 'Permanent Orbital Research Habitat',
        era: '2050',
        year: 2050,
        image: '/images/space/orbital-habitat.webp',
        alt: 'Rotating modular space station with artificial gravity ring orbiting above planet Earth',
        imagePrompt: 'Cinematic photograph of a rotating torus-ring artificial gravity orbital station floating above the blue curvature of Earth, solar array wings capturing brilliant sunlight, realistic spacecraft docking at the central zero-g hub, 8k resolution, photorealistic space photography, no text, no logos, no watermark.',
        description: 'Rotating ring habitat providing continuous one-third artificial gravity for research scientists and metallurgical engineers conducting microgravity crystallization.',
        breakthrough: 'Magnetic levitation slip-ring joints isolating rotating living quarters from zero-g industrial hubs.'
      }
    ]
  }
];

export const techCatalogue: TechCard[] = [
  // Category 1: Future AI (6 cards)
  {
    id: 'tech-ai-1',
    category: 'ai',
    title: 'Personal AI Companion Node',
    era: '2030',
    image: '/images/ai/personal-companion.webp',
    alt: 'Minimalist metallic physical AI companion device resting on a desk with subtle holographic projection',
    imagePrompt: 'Close-up studio product photography of a minimalist matte dark-titanium desktop intelligence node, emitting a faint geometric blue light projection of contextual information, high-end industrial design, tactile materials, natural ambient lighting, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'A dedicated hardware cryptographic enclave running private multi-modal reasoning locally. It manages household scheduling, legal filings, and personal knowledge graphs without third-party surveillance.',
    howItWorks: 'Utilises 3nm neuromorphic analog arrays performing matrix multiplications with less than 5 watts of power.'
  },
  {
    id: 'tech-ai-2',
    category: 'ai',
    title: 'Synthetic Consensus Engine',
    era: '2035',
    image: '/images/ai/consensus-engine.webp',
    alt: 'High-tech server facility with geometric crystalline computational modules and cool ambient illumination',
    imagePrompt: 'Cinematic industrial photograph inside an advanced optical quantum computing datacenter, crystalline optical processors connected by fine glass light conduits, calm deep navy and cyan illumination, clean room aesthetic, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Decentralised autonomous mediation software that analyses millions of municipal citizen priorities to draft balanced urban budgets. Replaces bureaucratic gridlock with mathematical transparency.',
    howItWorks: 'Executes game-theoretic Nash equilibrium simulations over encrypted zero-knowledge voter preference vectors.'
  },
  {
    id: 'tech-ai-3',
    category: 'ai',
    title: 'Autonomous Scientific Discovery Agent',
    era: '2035',
    image: '/images/ai/science-agent.webp',
    alt: 'Robotic chemistry lab apparatus mixing translucent chemical fluids guided by computer vision',
    imagePrompt: 'Interior laboratory photograph of an autonomous robotic pipetting arm conducting microfluidic crystal syntheses in a high-tech clean room, precise glass vials containing vibrant catalysts, soft fluorescent laboratory lighting, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'An AI researcher capable of autonomously formulating hypotheses, synthesising novel chemical polymers, and conducting physical lab experiments around the clock.',
    howItWorks: 'Combines molecular graph neural networks with automated microfluidic robotic synthesis carousels.'
  },
  {
    id: 'tech-ai-4',
    category: 'ai',
    title: 'Algorithmic Ecology Restorer',
    era: '2040',
    image: '/images/ai/ecology-restorer.webp',
    alt: 'Fleet of small autonomous quadcopter drones surveying a revitalised temperate forest canopy',
    imagePrompt: 'Wide angle nature documentary photograph of a dense rewilded forest, small autonomous conservation drones hovering quietly between ancient trees, dappled sunlight filtering through leaves, photorealistic cinematography, 8k resolution, no text, no logos, no watermark.',
    description: 'Ecosystem monitoring software coordinating swarms of micro-sensors and rewilding drones to track biodiversity, soil microbiomes, and microclimate shifts in real time.',
    howItWorks: 'Fuses airborne multi-spectral lidar data with subterranean acoustic mycorrhizal network monitors.'
  },
  {
    id: 'tech-ai-5',
    category: 'ai',
    title: 'Neuromorphic Real-Time Translator',
    era: '2030',
    image: '/images/ai/realtime-translator.webp',
    alt: 'Two people speaking in a multilingual conference with small discreet earpieces',
    imagePrompt: 'Realistic candid portrait of two international professionals in dialogue at a sunlit conference table, wearing barely visible ergonomic ear pieces, natural facial expressions, shallow depth of field, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Instantaneous conversational translation preserving pitch, nuance, and emotional cadence with under 20-millisecond latency. Eliminates linguistic friction in global commerce.',
    howItWorks: 'Processes acoustic phonetic phonemes directly on low-power analog spike-timing silicon.'
  },
  {
    id: 'tech-ai-6',
    category: 'ai',
    title: 'Deep Planetary Climate Simulator',
    era: '2050',
    image: '/images/ai/climate-simulator.webp',
    alt: 'Vast holographic globe display showing atmospheric wind vectors and ocean thermal gradients',
    imagePrompt: 'Cinematic photograph of researchers gathered around a high-resolution spherical volumetric display illustrating planetary atmospheric jetstreams and ocean currents, dark control room, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'A global computational digital twin predicting atmospheric and oceanic phenomena down to square-kilometer resolution fifty years into the future.',
    howItWorks: 'Couples petawatt optical matrix processors with planetary orbital satellite radar scatterometers.'
  },

  // Category 2: Vehicles & Transit (6 cards)
  {
    id: 'tech-veh-1',
    category: 'vehicles',
    title: 'Autonomous Urban Sky Taxi',
    era: '2030',
    image: '/images/vehicles/urban-sky-taxi.webp',
    alt: 'Sleek aerodynamic four-passenger eVTOL sky taxi docked at a high-rise rooftop skyport',
    imagePrompt: 'Photorealistic architectural still of a sleek aerodynamic four-passenger electric vertical takeoff aircraft docked on a rooftop skyport at golden hour, polished carbon-titanium fuselage, softly illuminated navigation diodes, cinematic depth of field, natural evening sunlight, ultra-detailed, 8k resolution, no text, no logos, no watermark.',
    description: 'Point-to-point electric vertical takeoff vehicles navigating municipal skyways with redundant acoustic mitigation. Commutes between metropolitan hubs bypass surface gridlock completely.',
    howItWorks: 'Uses distributed acoustic-shielded ducted fans driven by high-density lithium-sulfur cells.'
  },
  {
    id: 'tech-veh-2',
    category: 'vehicles',
    title: 'Intercity Maglev Hyper-Pod',
    era: '2035',
    image: '/images/vehicles/maglev-tube.webp',
    alt: 'Streamlined supersonic maglev train entering a transparent low-pressure elevated vacuum tube',
    imagePrompt: 'Dramatic wide-angle industrial photograph of a streamlined maglev train entering an elevated transparent low-pressure tube spanning across a dramatic valley landscape at sunset, cinematic lighting, motion blur on train, realistic engineering textures, 8k resolution, no text, no logos, no watermark.',
    description: 'Evacuated-tube passenger capsules traveling at over 900 km/h between capital cities. Delivers aircraft speed with rail efficiency and zero direct emissions.',
    howItWorks: 'Levitated by zero-resistance ceramic magnetic fields inside steel tubes maintained at 100 Pascals of atmospheric pressure.'
  },
  {
    id: 'tech-veh-3',
    category: 'vehicles',
    title: 'Automated Subterranean Cargo Shuttle',
    era: '2030',
    image: '/images/vehicles/cargo-shuttle.webp',
    alt: 'Underground transit tunnel with automated wheeled cargo pods moving along lighted track rails',
    imagePrompt: 'Industrial photograph inside a clean underground cargo logistics tunnel, automated electric freight pods moving smoothly on guideways, industrial LED lighting strips, clean concrete engineering, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Underground municipal freight tubes that transport packages and grocery containers directly beneath city streets. Eliminates heavy delivery trucks from surface pedestrian zones.',
    howItWorks: 'Continuous linear induction motors propelling standardized container carts through concrete micro-tunnels.'
  },
  {
    id: 'tech-veh-4',
    category: 'vehicles',
    title: 'Hydrogen Cryo-Hydrofoil Vessel',
    era: '2035',
    image: '/images/vehicles/hydrogen-hydrofoil.webp',
    alt: 'High-speed marine hydrofoil vessel lifted above ocean waves emitting water vapor',
    imagePrompt: 'Action seascape photograph of a sleek hydrogen-powered passenger hydrofoil cruising at high speed above coastal waters, hull lifted gracefully on underwater foils, crisp white sea spray, brilliant afternoon sun, photorealistic maritime photography, 8k resolution, no text, no logos, no watermark.',
    description: 'Coastal ferry ships that elevate above ocean waves on titanium hydrofoils, reducing hydrodynamic drag by 80%. Powered entirely by green liquid hydrogen fuel cells.',
    howItWorks: 'Ultra-low temperature liquid hydrogen tanks feeding proton-exchange membrane stacks powering twin submerged electric pod thrusters.'
  },
  {
    id: 'tech-veh-5',
    category: 'vehicles',
    title: 'Autonomous Stratospheric Glider',
    era: '2040',
    image: '/images/vehicles/strato-glider.webp',
    alt: 'Ultra-wide solar-paneled glider soaring silently in the dark purple stratosphere above the clouds',
    imagePrompt: 'Aerial photograph of an ultra-light carbon fiber solar atmospheric glider flying at 70,000 feet, curvature of Earth visible, deep indigo sky, thin white clouds far below, immaculate solar panel textures on wings, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Perpetual high-altitude atmospheric gliders acting as pseudo-satellites for telecommunications and emergency regional internet without rocket launches.',
    howItWorks: 'Harvests solar energy by day and descends slightly while gliding efficiently during night cycles.'
  },
  {
    id: 'tech-veh-6',
    category: 'vehicles',
    title: 'Autonomous Planetary Heavy-Lifter',
    era: '2050',
    image: '/images/vehicles/heavy-lifter.webp',
    alt: 'Massive heavy payload vertical rocket launching silently from an ocean launch pad',
    imagePrompt: 'Cinematic photograph of a fully reusable single-stage-to-orbit heavy transport vessel lifting off vertically from an oceanic offshore platform, blue-white methane-oxygen exhaust plume, sea mist illuminated by fire, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Rapid-turnaround fully reusable launch vehicles providing reliable orbital freight logistics at under fifty dollars per kilogram payload.',
    howItWorks: 'Full-flow staged combustion engines burning renewably synthesised liquid biomethane and liquid oxygen.'
  },

  // Category 3: Devices & Bionics (6 cards)
  {
    id: 'tech-dev-1',
    category: 'devices',
    title: 'Neural Motor Cortex Link',
    era: '2035',
    image: '/images/devices/neural-link.webp',
    alt: 'Ultra-thin biocompatible neural interface patch placed seamlessly behind an ear',
    imagePrompt: 'Detailed macro medical photography of an ultra-thin biocompatible flexible polymer neural patch adhered subtly behind a human ear, delicate microneedle contact points, subtle soft cyan diagnostic indicator, natural skin texture, clinical realism, 8k resolution, no text, no logos, no watermark.',
    description: 'A micron-scale cranial patch that translates intended motor signals into machine instructions with sub-millisecond precision. Eliminates traditional manual touch inputs for technical operators.',
    howItWorks: 'Micro-array electrodes record cortical field potentials and stream them over encrypted near-field magnetic induction.'
  },
  {
    id: 'tech-dev-2',
    category: 'devices',
    title: 'Smart Corneal Contact Display',
    era: '2030',
    image: '/images/devices/corneal-display.webp',
    alt: 'Extreme close up of a human eye wearing a transparent micro-electronic contact lens',
    imagePrompt: 'Extreme macro beauty photograph of a human eye with an ultra-thin transparent smart contact lens, microscopic transparent gold circuits along the outer perimeter, natural iris pigmentation, studio lighting, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Transparent micro-LED lenses that project contextual navigational graphics and text directly onto the retina. Replaces bulky head-mounted visors completely.',
    howItWorks: 'Wireless power captured from ambient radiofrequency fields powering sub-pixel quantum dots.'
  },
  {
    id: 'tech-dev-3',
    category: 'devices',
    title: 'Bio-Synthetic Robotic Exosuit',
    era: '2035',
    image: '/images/devices/bio-exosuit.webp',
    alt: 'Industrial worker wearing lightweight woven composite robotic exoskeleton legs and spine',
    imagePrompt: 'Full body photograph of an engineer in an industrial assembly hangar wearing a form-fitting composite fabric exoskeleton, slender carbon actuators along thighs and spine, natural workshop lighting, 8k resolution, photorealistic industrial design, no text, no logos, no watermark.',
    description: 'Wearable soft textile exosuits that multiply lifting capacity and prevent musculoskeletal fatigue. Fits seamlessly beneath standard occupational apparel.',
    howItWorks: 'Artificial electro-active polymer muscles contract when small electrical voltages are applied.'
  },
  {
    id: 'tech-dev-4',
    category: 'devices',
    title: 'Haptic Holographic Interface',
    era: '2035',
    image: '/images/devices/haptic-holo.webp',
    alt: 'Hands manipulating a three-dimensional light interface in mid-air with ultrasonic tactile emitters',
    imagePrompt: 'Close up photograph of a technician interacting with an intricate glowing volumetric interface floating above a sleek console, hands feeling invisible tactile controls, dark room with crisp cyan light reflections on hands, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Mid-air volumetric display systems that emit focused ultrasound waves, allowing users to physically feel dials, buttons, and switches in empty air.',
    howItWorks: 'Phased acoustic transducer arrays create acoustic focal points that stimulate human cutaneous mechanoreceptors.'
  },
  {
    id: 'tech-dev-5',
    category: 'devices',
    title: 'High-Density Graphene Micro-Battery',
    era: '2030',
    image: '/images/devices/graphene-battery.webp',
    alt: 'Miniature micro-battery cell smaller than a coin held with laboratory tweezers',
    imagePrompt: 'Macro product photograph of a miniature black graphene micro-battery cell held gently by titanium tweezers, precise laser-etched serial codes, soft studio lighting on brushed metal table, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Coin-sized electrochemical cells capable of full charge cycles in under forty seconds with ten times the energy density of legacy batteries.',
    howItWorks: 'Porous laser-scribed graphene lattices providing enormous specific surface area for rapid ionic transfer.'
  },
  {
    id: 'tech-dev-6',
    category: 'devices',
    title: 'Optoelectronic Bionic Retina',
    era: '2040',
    image: '/images/devices/bionic-retina.webp',
    alt: 'Ophthalmology examination room showing a bionic ocular implant on a medical monitor',
    imagePrompt: 'Medical clinical photograph showing an ophthalmologist examining a patient with a sub-retinal micro-photodiode array, clinical monitors displaying high-resolution retinal vascular scans, clean medical room lighting, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Sub-retinal photodiode implants that convert incoming photons directly into neurochemical signals, fully restoring functional vision to individuals with degenerative retinal disease.',
    howItWorks: 'Self-powered silicon micro-photodiodes stimulate surviving retinal bipolar and ganglion cell networks directly.'
  },

  // Category 4: Home & Workplace (6 cards)
  {
    id: 'tech-home-1',
    category: 'home-work',
    title: 'Adaptive Smart Glass Architecture',
    era: '2030',
    image: '/images/home-work/adaptive-glass.webp',
    alt: 'Modern skyscraper apartment interior with panoramic windows tinting automatically against harsh sun',
    imagePrompt: 'Interior architectural photograph of a high-rise living space overlooking a skyline, dynamic electrochromic glass tinting softly to control solar glare, minimal sustainable wood and steel furnishings, warm morning sunlight, photorealistic interior design, 8k resolution, no text, no logos, no watermark.',
    description: 'Dynamic photovoltaic glazing that shifts opacity instantaneously while converting incident sunlight into building baseload power. Reduces residential thermal loads by 45%.',
    howItWorks: 'Perovskite-based electrochromic nanocrystals embedded in double-glazed vacuum envelopes.'
  },
  {
    id: 'tech-home-2',
    category: 'home-work',
    title: 'Engineered Mycelium Urban Modules',
    era: '2035',
    image: '/images/home-work/mycelium-modules.webp',
    alt: 'Modern architectural building pavilion constructed from organic grown mycelium composite blocks',
    imagePrompt: 'High-end architectural photograph of an avant-garde urban pavilion built from grown structural mycelium composites, warm natural earthy texture combined with geometric precision, evening architectural spotlighting, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Self-healing architectural building units cultivated from agricultural byproducts and fungal mycelium. They capture carbon during growth and outperform structural timber in thermal insulation.',
    howItWorks: 'Genetically optimised mycelial hyphae producing high-density chitin crosslinks during curing.'
  },
  {
    id: 'tech-home-3',
    category: 'home-work',
    title: 'Closed-Loop Residential Water Cycler',
    era: '2030',
    image: '/images/home-work/water-cycler.webp',
    alt: 'Sleek brushed-metal household utility cabinet with clear monitoring conduits showing purified water',
    imagePrompt: 'Clean modern utility room photograph showing an ultra-compact domestic water purification cabinet, brushed aluminum finish, clear glass diagnostic column showing crystal clear water, warm indirect lighting, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Compact home recycling systems that recover and sterilise 98% of greywater and shower runoff on-site, cutting municipal water demand to near zero.',
    howItWorks: 'Multi-stage forward osmosis membranes combined with ultraviolet-C photocatalytic oxidation chambers.'
  },
  {
    id: 'tech-home-4',
    category: 'home-work',
    title: 'Autonomous Indoor Aeroponic Farm Wall',
    era: '2030',
    image: '/images/home-work/aeroponic-wall.webp',
    alt: 'Living vertical aeroponic vegetable garden wall inside a contemporary kitchen dining area',
    imagePrompt: 'Interior photograph of a sleek architectural kitchen featuring a floor-to-ceiling vertical aeroponic produce wall, vibrant lush green leafy greens and herbs under tuned pink-white agricultural LEDs, natural morning light, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Living vertical food systems inside home kitchens delivering fresh greens, strawberries, and herbs year-round with 95% less water than outdoor agriculture.',
    howItWorks: 'Pressurised nutrient mist cycles misting root tips suspended in air without soil substrates.'
  },
  {
    id: 'tech-home-5',
    category: 'home-work',
    title: 'Sonic Acoustic Soundproofing Fields',
    era: '2035',
    image: '/images/home-work/acoustic-field.webp',
    alt: 'Quiet open plan office with transparent acoustic baffle fixtures dampening noise perfectly',
    imagePrompt: 'Architectural photograph of a serene minimalist co-working lounge in a busy city center, subtle ceiling-mounted acoustic array panels, natural warm oak and raw concrete finishes, soft sunlight, photorealistic interior design, 8k resolution, no text, no logos, no watermark.',
    description: 'Ceiling transducers that generate anti-phase pressure zones, creating private conversational acoustic bubbles in open offices without physical walls.',
    howItWorks: 'Ultra-low latency digital signal processors computing continuous inverse wave equations.'
  },
  {
    id: 'tech-home-6',
    category: 'home-work',
    title: 'Kinetic Energy Harvesting Floors',
    era: '2035',
    image: '/images/home-work/kinetic-floors.webp',
    alt: 'Subtle slate tile flooring in a busy train transit terminal hallway subtly illuminated along edge lines',
    imagePrompt: 'Ground-level architectural photograph of sleek dark stone tile flooring in a modern public transit plaza, subtle edge luminescence where pedestrians walk, clean geometric reflections, natural public space lighting, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Sub-millimeter deflecting floor tiles that convert pedestrian footsteps into electrical power to illuminate municipal corridors and power emergency beacons.',
    howItWorks: 'Piezoelectric ceramic crystals generating electrical charges under compressive mechanical shear.'
  },

  // Category 5: Health & Biology (6 cards)
  {
    id: 'tech-hlth-1',
    category: 'health',
    title: 'Autonomous Mobile Medical Pod',
    era: '2035',
    image: '/images/health/mobile-med-pod.webp',
    alt: 'Sleek white autonomous medical vehicle parked in a suburban neighborhood performing diagnostics',
    imagePrompt: 'Exterior photograph of a compact autonomous medical clinic vehicle parked outside a contemporary suburban home, hygienic matte-white carbon composite exterior, clean illuminated biometric scan portal, dawn lighting, realistic street scene, 8k resolution, no text, no logos, no watermark.',
    description: 'Self-driving diagnostic sanctuaries that deploy directly to patients for automated blood chemistry, ultrasound imaging, and on-site pharmacy dispensing within minutes.',
    howItWorks: 'Miniaturised microfluidic spectrometry coupled with automated sterile robotic sample handling.'
  },
  {
    id: 'tech-hlth-2',
    category: 'health',
    title: 'Targeted mRNA Cellular Rejuvenator',
    era: '2035',
    image: '/images/health/mrna-rejuvenator.webp',
    alt: 'Scientific visualization of a lipid nanoparticle delivering synthetic mRNA to a human cell membrane',
    imagePrompt: 'Scientific medical illustration rendered with photorealistic cinematic depth of field, lipid nanoparticle engaging with a cell surface, subtle cellular membrane translucence, deep ocean blues and violet lighting, 8k resolution, photorealistic biology, no text, no logos, no watermark.',
    description: 'Therapeutic lipid nanoparticles delivering reprogramming factors that restore youthful epigenetic gene expression in aging cardiovascular tissues.',
    howItWorks: 'Transient expression of Yamanaka reprogramming factors without inducing oncogenic dedifferentiation.'
  },
  {
    id: 'tech-hlth-3',
    category: 'health',
    title: '3D Bio-Printed Organ Replacement',
    era: '2040',
    image: '/images/health/bioprinted-organ.webp',
    alt: 'Sterile medical bioprinter depositing vascularized living tissue scaffold in a laboratory chamber',
    imagePrompt: 'Medical laboratory photograph of a sterile precision 3D bioprinter nozzle carefully depositing biological hydrogel matrix in an illuminated glass sterile enclosure, surgical cleanliness, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Fully transplantable kidneys and livers printed from a patient’s own stem cells on biocompatible extracellular scaffolds, eliminating transplant waitlists.',
    howItWorks: 'Stereolithographic deposition of patient-derived induced pluripotent stem cells inside collagen hydrogels.'
  },
  {
    id: 'tech-hlth-4',
    category: 'health',
    title: 'Sub-Dermal Continuous Metabolic Sensor',
    era: '2030',
    image: '/images/health/metabolic-sensor.webp',
    alt: 'Close up of a tiny translucent sensor patch on forearm glowing faintly with health telemetry',
    imagePrompt: 'Close up photograph of a forearm with a translucent flexible dermal sensor patch, microscopic microfluidic capillaries faintly illuminated with soft amber diode, natural skin texture and fine hairs, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Pain-free micro-needle patches continuously measuring glucose, lactate, cortisol, and hydration levels, alerting individuals prior to physiological distress.',
    howItWorks: 'Enzymatic electrochemical assays sampling interstitial fluid in the superficial dermis continuously.'
  },
  {
    id: 'tech-hlth-5',
    category: 'health',
    title: 'Microbial Gut Microbiome Synthesizer',
    era: '2035',
    image: '/images/health/microbiome-synth.webp',
    alt: 'Personalized medical nutrient dispenser bottle on a clean bathroom countertop',
    imagePrompt: 'Product photograph of a bespoke frosted glass pharmaceutical dispenser with automated dosing chamber, resting on a clean concrete bathroom sink with morning sunlight, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Personalised daily probiotic formulations synthesised each morning to rebalance digestive microbiota and alleviate chronic systemic inflammation.',
    howItWorks: 'Micro-scale desktop fermentation cartridges culturing targeted live bacterial strains based on real-time biometric telemetry.'
  },
  {
    id: 'tech-hlth-6',
    category: 'health',
    title: 'Non-Invasive Focused Ultrasound Oncology',
    era: '2040',
    image: '/images/health/ultrasound-oncology.webp',
    alt: 'Modern clinical oncology treatment suite with high-precision acoustic medical gantry',
    imagePrompt: 'Interior photograph of a high-tech medical clinic treatment room, a sleek robotic ultrasound transducer arm positioned over a comfortable patient examination bed, calm ambient blue lighting, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Acoustic thermal ablation systems that destroy internal tumor clusters without skin incisions, radiation exposure, or hospital recovery stays.',
    howItWorks: 'Intersecting acoustic wave beams converging precisely on tumor tissue to induce thermal cavitation.'
  },

  // Category 6: Energy & Climate (6 cards)
  {
    id: 'tech-nrg-1',
    category: 'energy',
    title: 'Commercial Fusion Baseload Tokamak',
    era: '2050',
    image: '/images/energy/fusion-reactor.webp',
    alt: 'Interior of a massive commercial magnetised fusion tokamak glowing with pale violet magnetic plasma',
    imagePrompt: 'Interior industrial photograph inside an operational nuclear fusion power generation facility, massive magnetic toroidal coils surrounding a central reaction vacuum chamber with soft violet plasma reflection, gleaming stainless steel conduits, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Net-positive magnetised fusion plants generating continuous emissions-free electricity from deuterium extracted safely from seawater. Supplies clean power to desalination complexes.',
    howItWorks: 'High-field rare-earth barium copper oxide (REBCO) superconducting magnets sustaining stable plasma equilibrium.'
  },
  {
    id: 'tech-nrg-2',
    category: 'energy',
    title: 'Next-Gen Solid-State Grid Storage',
    era: '2030',
    image: '/images/energy/solid-state-grid.webp',
    alt: 'Massive modular solid-state energy storage units arranged in an arid renewable energy farm',
    imagePrompt: 'Wide cinematic industrial photograph of modern modular solid-state battery energy storage containers integrated into a vast solar-wind desert facility at dusk, clean industrial layout, ambient safety illumination, photorealistic concept photography, 8k resolution, no text, no logos, no watermark.',
    description: 'Non-flammable solid-state electrolyte battery banks capable of stabilizing regional electrical grids during multi-day renewable intermittency. Degrades less than 1% over twenty years.',
    howItWorks: 'Ceramic-polymer composite separators preventing lithium dendrite puncture under high thermal loads.'
  },
  {
    id: 'tech-nrg-3',
    category: 'energy',
    title: 'Oceanic Atmospheric Carbon Scrubber',
    era: '2050',
    image: '/images/energy/ocean-carbon-scrubber.webp',
    alt: 'Massive floating autonomous marine platform with bio-reactors processing ocean surface waters',
    imagePrompt: 'Wide seascape photograph of an autonomous floating hexagonal ocean facility in the open sea, sleek industrial carbon hull with automated seawater intake arrays and bioreactor tanks, stormy overcast sky, natural water splash physics, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Hexagonal deep-sea floating refineries that accelerate marine alkalinity and capture dissolved atmospheric carbon dioxide into stable inert calcium bicarbonate minerals.',
    howItWorks: 'Solar-powered electro-dialysis cells that mineralise ocean acidity while outputting green hydrogen.'
  },
  {
    id: 'tech-nrg-4',
    category: 'energy',
    title: 'Perovskite Tandem Solar Canvas',
    era: '2030',
    image: '/images/energy/tandem-solar.webp',
    alt: 'Close up of ultra-flexible crystalline solar film reflecting iridescent rainbow hues in sun',
    imagePrompt: 'Detailed macro photograph of a flexible thin-film solar cell membrane roll, iridescent anti-reflective optical coating reflecting sunlight, precision engineered texture, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Flexible roll-to-roll solar membranes achieving over 34% photovoltaic conversion efficiency. Can be applied like film over vehicle bodies and building facades.',
    howItWorks: 'Stacked tandem layers capturing different wavelengths of the solar spectrum without thermal recombination losses.'
  },
  {
    id: 'tech-nrg-5',
    category: 'energy',
    title: 'Deep Superhot Geothermal Tap',
    era: '2040',
    image: '/images/energy/superhot-geothermal.webp',
    alt: 'Geothermal energy harvesting plant situated in a rugged volcanic caldera landscape',
    imagePrompt: 'Cinematic photograph of a superhot geothermal energy plant in a rugged volcanic mountain landscape, insulated steam pipes running across dark volcanic basalt rock, dramatic early morning lighting, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Deep drilling rigs penetrating five kilometers into the Earth’s crust to access supercritical water at 400°C, delivering ten times the power of conventional geothermal wells.',
    howItWorks: 'Directional plasma-arc drilling heads cutting through dense basement granite to tap supercritical hydrothermal reservoirs.'
  },
  {
    id: 'tech-nrg-6',
    category: 'energy',
    title: 'Atmospheric Fog Harvesting Tower',
    era: '2035',
    image: '/images/energy/fog-tower.webp',
    alt: 'Towering architectural biomimetic mesh tower standing in coastal desert fog harvesting water',
    imagePrompt: 'High-end architectural photograph of an elegant biomimetic mesh tower rising from coastal desert sand dunes, morning fog condensing into visible water droplets on fine titanium mesh, moody ocean haze, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'Biomimetic coastal towers inspired by Namib beetles that capture thousands of liters of potable water daily from coastal fog banks without electrical energy.',
    howItWorks: 'Alternating hydrophobic and hydrophilic surface micro-ridges channeling condensed moisture into cisterns.'
  },

  // Category 7: Deep Space (6 cards)
  {
    id: 'tech-spc-1',
    category: 'space',
    title: 'Lunar South-Pole Water Harvester',
    era: '2050',
    image: '/images/space/lunar-harvester.webp',
    alt: 'Rugged autonomous robotic rover mining water ice in the shadowed crater rim of the Moon',
    imagePrompt: 'Cinematic planetary photograph of a rugged heavy-duty autonomous mining rover operating on the jagged rim of a Moon crater, stark harsh lunar sunlight, deep black shadows, fine lunar regolith dust, Earth visible in the dark starry sky above, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Autonomous extraction rovers operating inside permanently shadowed lunar craters. They vaporise ice deposits to manufacture rocket propellant and drinking reserves for deep-space missions.',
    howItWorks: 'Cryogenic microwave thermal sublimation domes extracting water vapor without bulk excavation.'
  },
  {
    id: 'tech-spc-2',
    category: 'space',
    title: 'Permanent Orbital Research Habitat',
    era: '2050',
    image: '/images/space/orbital-habitat.webp',
    alt: 'Rotating modular space station with artificial gravity ring orbiting above planet Earth',
    imagePrompt: 'Cinematic photograph of a rotating torus-ring artificial gravity orbital station floating above the blue curvature of Earth, solar array wings capturing brilliant sunlight, realistic spacecraft docking at the central zero-g hub, 8k resolution, photorealistic space photography, no text, no logos, no watermark.',
    description: 'Rotating ring habitat providing continuous one-third artificial gravity for research scientists and metallurgical engineers conducting microgravity crystallization.',
    howItWorks: 'Magnetic levitation slip-ring joints isolating rotating living quarters from zero-g industrial hubs.'
  },
  {
    id: 'tech-spc-3',
    category: 'space',
    title: 'Solar Electric Ion Propulsion Tug',
    era: '2040',
    image: '/images/space/ion-tug.webp',
    alt: 'Uncrewed deep space cargo tug firing brilliant blue xenon ion thrusters past Mars',
    imagePrompt: 'Photorealistic astronomical photograph of a robotic deep space cargo craft cruising past the red planet Mars, long delicate solar array panels, glowing cyan-blue ion thruster plume expanding into vacuum, starry deep space, 8k resolution, no text, no logos, no watermark.',
    description: 'High-efficiency cargo tugboats operating continuously between Earth orbit, lunar staging stations, and Mars orbital depots with exceptional fuel economy.',
    howItWorks: 'Hall-effect thrusters accelerating ionized xenon gas to exhaust velocities exceeding 30,000 meters per second.'
  },
  {
    id: 'tech-spc-4',
    category: 'space',
    title: 'In-Situ Lunar Regolith 3D Printer',
    era: '2040',
    image: '/images/space/regolith-printer.webp',
    alt: 'Robotic gantry laying down sintered volcanic basalt dome structure on the surface of the Moon',
    imagePrompt: 'Industrial photograph on the Moon surface showing an automated robotic construction gantry sintering lunar regolith into a protective dome habitat shell, stark lunar shadows, Earth in the sky, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Robotic construction units that fuse local moon dust into radiation-shielded habitat domes using concentrated solar thermal sintering.',
    howItWorks: 'Fresnel solar concentrators focusing sunlight to melt raw lunar silicate dust into solid vitrified basalt.'
  },
  {
    id: 'tech-spc-5',
    category: 'space',
    title: 'Nuclear Thermal Rocket Upper Stage',
    era: '2045',
    image: '/images/space/nuclear-rocket.webp',
    alt: 'Nuclear thermal spacecraft stage firing its engine in the dark void between planets',
    imagePrompt: 'Cinematic space render photograph of a long interplanetary transit ship firing a nuclear thermal rocket engine, white hydrogen propellant glow, realistic spacecraft thermal insulation blankets and truss radiators, starry background, 8k resolution, photorealistic, no text, no logos, no watermark.',
    description: 'High-thrust interplanetary propulsion stages that cut transit times to Mars from nine months to under one hundred days, dramatically reducing crew cosmic radiation dosage.',
    howItWorks: 'High-assay low-enriched uranium core heating liquid hydrogen propellant to over 2,700 Kelvin.'
  },
  {
    id: 'tech-spc-6',
    category: 'space',
    title: 'Centimetric Laser Asteroid Deflector',
    era: '2050',
    image: '/images/space/asteroid-deflector.webp',
    alt: 'Orbital satellite firing a concentrated thermal laser pulse at a tumbling dark asteroid',
    imagePrompt: 'Cinematic photograph in deep space of a defensive satellite directing a concentrated beam of light at a cratered rocky asteroid, subtle plume of vaporised gas ejecting from the rock surface acting as a thruster, photorealistic, 8k resolution, no text, no logos, no watermark.',
    description: 'Planetary defense satellites that vaporise tiny patches of approaching near-Earth asteroids, creating gentle jet thrusts that divert orbital paths decades in advance.',
    howItWorks: 'Laser surface ablation generating an exhaust jet of vaporised rock that alters the asteroid orbital velocity.'
  }
];
