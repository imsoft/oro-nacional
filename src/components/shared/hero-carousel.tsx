"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroCarouselProps {
  images: Array<{ id: string; image_url: string; display_order: number }>;
  autoPlayInterval?: number;
  imageAlt?: string;
}

export default function HeroCarousel({
  images,
  autoPlayInterval = 5000,
  imageAlt = "Hero image",
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning || images.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [images.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || images.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [images.length, isTransitioning]);

  const goToSlide = (index: number) => {
    if (isTransitioning || images.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Auto-play functionality
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoPlayInterval, images.length]);

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-muted to-muted/50" />
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      {/* Images */}
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            alt={`${imageAlt} ${index + 1}`}
            src={image.image_url}
            fill
            priority={index === 0}
            className="object-cover dark:brightness-50"
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/80" />

      {/* Navigation buttons - only show if more than 1 image */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/20 hover:bg-background/40 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
            onClick={prevSlide}
            disabled={isTransitioning}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/20 hover:bg-background/40 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
            onClick={nextSlide}
            disabled={isTransitioning}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-[#D4AF37]"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
