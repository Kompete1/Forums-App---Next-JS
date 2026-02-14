export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "kyalami-main",
    title: "South African Motorsport Community",
    subtitle: "Track talk, setup notes, race weekends, and driver development in one paddock.",
    imageSrc: "/hero/hero-circuit.jpg",
    imageAlt: "Circuit race cars taking a sweeping corner during a South African track session",
  },
  {
    id: "karting-grid",
    title: "From Karting To Circuit",
    subtitle: "Share racecraft, kart setup, and progression pathways across disciplines.",
    imageSrc: "/hero/hero-karting.jpeg",
    imageAlt: "Competitive karting pack racing through a paved corner",
  },
  {
    id: "sim-racing",
    title: "Real Drivers, Sim Drivers, Same Competitive Edge",
    subtitle: "Discuss rigs, telemetry, leagues, and sim-to-real-world crossover.",
    imageSrc: "/hero/hero-sim.jpeg",
    imageAlt: "Driver seated in a sim racing cockpit at a motorsport event setup",
  },
];
