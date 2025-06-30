import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, HandshakeIcon } from "lucide-react";

// Custom hook for counting animation
function useCountUp(end: number, duration: number = 2000, suffix: string = "") {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById("stats-section");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return count + suffix;
}

export function HeroSection() {
  const chaptersCount = useCountUp(25, 2000);
  const membersCount = useCountUp(1100, 2500, "+");

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center relative overflow-hidden bg-background"
    >
      {/* Wave Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 C400,100 800,220 1200,160 L1200,400 L0,400 Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M0,200 C300,140 600,260 1200,180 L1200,400 L0,400 Z"
            fill="currentColor"
            className="text-primary opacity-60"
          />
        </svg>
      </div>

      {/* Hero Image - Hidden on mobile, visible on larger screens */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[60%] h-screen z-0">
        <div className="relative w-full h-full">
          <Image
            src="/hero-section-images/ktp-hero.png"
            alt="Kappa Theta Pi Members"
            fill
            className="object-contain object-center transition-transform duration-500 cursor-pointer"
            priority
          />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 relative z-20">
        <div className="lg:max-w-2xl">
          {/* Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-9xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Kappa Theta Pi
              </h1>
              <p className="text-base sm:text-2xl text-muted-foreground max-w-lg mx-auto mt-10 lg:mx-0 tracking-tight">
                The world&apos;s first co-educational professional technology fraternity, here in Indiana.
              </p>
            </div>

            {/* Mobile Hero Image */}
            <div className="lg:hidden w-full max-w-md mx-auto my-8">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/hero-section-images/ktp-hero.png"
                  alt="Kappa Theta Pi Members"
                  fill
                  className="object-cover object-center transition-transform duration-500 cursor-pointer"
                  priority
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="group shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                onClick={() => scrollToSection("#rush")}
              >
                Rush KTP
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                onClick={() => scrollToSection("#partnerships")}
              >
                Partner With Us
                <HandshakeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Button>
            </div>

            {/* Stats with Animation */}
            <div
              id="stats-section"
              className="flex flex-wrap gap-6 sm:gap-8 pt-4 justify-center lg:justify-start"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {chaptersCount}
                </div>
                <div className="text-sm text-muted-foreground">Chapters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {membersCount}
                </div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
