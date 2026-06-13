"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type Brand = {
  _id: string;
  name: string;
  logoUrl: string;
};

export function BrandsMarquee() {
  const brands = useQuery(api.brands.list) as Brand[] | undefined;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !brands || brands.length === 0) return;

    const logos = section.querySelectorAll(".brand-logo-item");

    // Set 3D perspective on marquee container
    const marqueeContainer = section.querySelector(".animate-marquee");
    if (marqueeContainer) {
      gsap.set(marqueeContainer, { perspective: 1000 });
    }

    gsap.set(logos, {
      opacity: 0,
      scale: 0.3,
      rotateX: 45,
      y: 20,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(logos, {
              opacity: 0.45,
              scale: 1,
              rotateX: 0,
              y: 0,
              duration: 1.0,
              stagger: {
                each: 0.05,
                from: "random",
              },
              ease: "back.out(1.8)",
            });
            observer.unobserve(section);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(logos);
    };
  }, [brands]);

  if (!brands || brands.length === 0) {
    return null;
  }

  // Duplicate brands to ensure there are plenty of logos to cover screen widths for a seamless loop
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full overflow-hidden border-t border-[var(--border-soft)] bg-transparent py-14"
    >
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite !important;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex w-full overflow-hidden mask-fade-edges">
        <div className="flex animate-marquee gap-16 items-center whitespace-nowrap">
          {duplicatedBrands.map((brand, index) => (
            <div
              key={`${brand._id}-${index}`}
              className="brand-logo-item flex items-center justify-center shrink-0 w-28 h-12 grayscale opacity-45 hover:grayscale-0 hover:opacity-100 transition-[filter,opacity] duration-300"
            >
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain opacity-90"
                />
              ) : (
                <span className="text-sm font-bold tracking-wider text-[var(--text-muted)] uppercase">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
