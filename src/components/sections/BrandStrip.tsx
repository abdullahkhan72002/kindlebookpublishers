"use client";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

export type BrandStripProps = {
  brands: string[];
};

export default function BrandStrip({ brands }: BrandStripProps) {
  return (
    <Reveal variant="fade-up" delay={80} className="overflow-hidden bg-[#1B1B1B]">
      <Container className="mx-auto grid w-full grid-cols-2 items-center justify-center gap-4 py-4 sm:grid-cols-4 sm:gap-6">
        {brands.map((brand, index) => (
          <img
            key={brand}
            src={`/hero-logo-${index + 1}.webp`}
            alt={brand}
            className="mx-auto w-full max-w-36 sm:max-w-44"
          />
        ))}
      </Container>
    </Reveal>
  );
}
