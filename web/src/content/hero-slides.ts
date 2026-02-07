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
    imageSrc: "/hero/hero-kyalami.svg",
    imageAlt: "Stylized race track and timing board inspired by South African circuit racing",
  },
  {
    id: "karting-grid",
    title: "From Karting To Circuit",
    subtitle: "Share racecraft, kart setup, and progression pathways across disciplines.",
    imageSrc: "/hero/hero-karting.svg",
    imageAlt: "Stylized karting grid with helmets and race numbers",
  },
  {
    id: "sim-racing",
    title: "Real Drivers, Sim Drivers, Same Competitive Edge",
    subtitle: "Discuss rigs, telemetry, leagues, and sim-to-real-world crossover.",
    imageSrc: "/hero/hero-sim.svg",
    imageAlt: "Stylized sim racing cockpit and monitor with telemetry lines",
  },
];
