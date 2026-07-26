import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { HotelSearch } from "@/components/nbc/HotelSearch";
import heroImage from "@/assets/hero-resort.jpg";

interface HeroProps {
  eyebrow?: string;
  headline: string;
  supporting: string;
  primaryCta: string;
  secondaryCta: string;
  /** Optional search widget integrated into the lower hero. */
  search?: ReactNode;
}

/**
 * Hero experience — photography first, storytelling before utility.
 * The search widget sits inside the hero composition, not detached from it.
 */
export function Hero({
  eyebrow = "NBC Hospitality",
  headline,
  supporting,
  primaryCta,
  secondaryCta,
  search = <HotelSearch />,
}: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-nbc-royal-deep">
      <img
        src={heroImage}
        alt="An NBC Hospitality partner resort overlooking the Indian Ocean at sunset"
        width={1920}
        height={1280}
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover"
      />
      <div aria-hidden="true" className="nbc-veil absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-24 sm:pt-32 lg:px-8 lg:pb-20 lg:pt-44">
        <div className="max-w-3xl">
          <p className="nbc-eyebrow text-nbc-gold">{eyebrow}</p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-primary-foreground sm:text-6xl lg:text-7xl">
            {headline}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            {supporting}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="scarlet" size="xl">
              {primaryCta}
            </Button>
            <Button variant="outlineOnDark" size="xl">
              {secondaryCta}
            </Button>
          </div>
        </div>

        <div className="mt-16 lg:mt-24">{search}</div>
      </div>
    </section>
  );
}
