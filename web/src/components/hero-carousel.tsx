"use client";

import Image from "next/image";
import { useState } from "react";
import type { HeroSlide } from "@/content/hero-slides";

type HeroCarouselProps = {
  slides: HeroSlide[];
};

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  if (slides.length === 0) {
    return null;
  }

  function goTo(index: number) {
    if (index < 0) {
      setActiveIndex(slides.length - 1);
      return;
    }

    if (index >= slides.length) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(index);
  }

  return (
    <section className="hero-card" aria-label="Featured motorsport highlights">
      <div className="hero-image-wrap">
        <Image
          src={activeSlide.imageSrc}
          alt={activeSlide.imageAlt}
          fill
          priority={activeIndex === 0}
          loading={activeIndex === 0 ? "eager" : "lazy"}
          fetchPriority={activeIndex === 0 ? "high" : "auto"}
          quality={75}
          sizes="(max-width: 860px) 94vw, 62vw"
          className="hero-image"
        />
      </div>
      <div className="hero-content">
        <p className="kicker">South African Motorsport Forum</p>
        <h1>{activeSlide.title}</h1>
        <p>{activeSlide.subtitle}</p>
        <div className="hero-controls">
          <button type="button" className="btn btn-secondary" onClick={() => goTo(activeIndex - 1)} aria-label="Previous slide">
            Previous
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => goTo(activeIndex + 1)} aria-label="Next slide">
            Next
          </button>
        </div>
        <div className="hero-dots" aria-label="Slide navigation">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              className={index === activeIndex ? "hero-dot active" : "hero-dot"}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
