import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logo from "@/assets/nbc-logo.png.asset.json";

interface NbcLogoProps {
  /** "plain" for light surfaces, "card" for the white badge used on dark surfaces. */
  variant?: "plain" | "card";
  className?: string;
  /** Rendered lockup height in pixels. */
  height?: number;
}

/**
 * Official NBC lockup. Reused across navigation, footer and future portals.
 */
export function NbcLogo({ variant = "plain", className, height = 40 }: NbcLogoProps) {
  const image = (
    <img
      src={logo.url}
      alt="NBC — National Bank of Commerce"
      width={height * 1.51}
      height={height}
      style={{ height, width: "auto" }}
      className="block w-auto"
    />
  );

  return (
    <Link
      to="/"
      aria-label="NBC Hospitality home"
      className={cn(
        "inline-flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {variant === "card" ? (
        <span className="inline-flex items-center rounded-xl bg-background px-3 py-2 shadow-card">
          {image}
        </span>
      ) : (
        image
      )}
      <span className="sr-only">NBC Hospitality</span>
    </Link>
  );
}
