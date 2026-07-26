import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { GalleryCategory, GalleryImage } from "@/lib/nbc-property";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: GalleryImage[];
  className?: string;
}

/** In-page gallery with category filtering — no navigation required. */
export function PropertyGallery({ images, className }: PropertyGalleryProps) {
  const categories = useMemo(() => {
    const unique: GalleryCategory[] = [];
    for (const image of images) {
      if (!unique.includes(image.category)) unique.push(image.category);
    }
    return unique;
  }, [images]);

  const [active, setActive] = useState<GalleryCategory | "All">("All");
  const [selected, setSelected] = useState(0);

  const visible = useMemo(
    () => (active === "All" ? images : images.filter((image) => image.category === active)),
    [active, images],
  );

  const feature = visible[Math.min(selected, visible.length - 1)] ?? images[0];

  return (
    <div className={cn("grid gap-8", className)}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Gallery categories">
        {(["All", ...categories] as const).map((category) => {
          const isActive = active === category;
          return (
            <Button
              key={category}
              role="tab"
              aria-selected={isActive}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => {
                setActive(category);
                setSelected(0);
              }}
            >
              {category}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <figure className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
          <img
            src={feature.src}
            alt={feature.alt}
            width={1200}
            height={900}
            loading="lazy"
            className="aspect-4/3 size-full object-cover"
          />
          <figcaption className="flex items-center justify-between gap-4 px-6 py-4 text-sm text-muted-foreground">
            <span className="min-w-0 truncate">{feature.alt}</span>
            <span className="nbc-eyebrow shrink-0 text-[0.625rem] text-nbc-royal">
              {feature.category}
            </span>
          </figcaption>
        </figure>

        <ul className="grid grid-cols-3 gap-4 lg:grid-cols-2 lg:content-start">
          {visible.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show ${image.alt}`}
                aria-current={feature.id === image.id}
                className={cn(
                  "group block w-full overflow-hidden rounded-xl border transition-all duration-300 ease-out",
                  feature.id === image.id
                    ? "border-nbc-royal ring-2 ring-nbc-royal/25"
                    : "border-border/70 hover:border-nbc-royal/50",
                )}
              >
                <img
                  src={image.src}
                  alt=""
                  width={600}
                  height={450}
                  loading="lazy"
                  className="aspect-4/3 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
