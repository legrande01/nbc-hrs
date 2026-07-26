import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

import { NbcLogo } from "@/components/nbc/NbcLogo";
import { NewsletterForm } from "@/components/nbc/NewsletterForm";
import { GiraffePattern } from "@/components/nbc/GiraffePattern";
import { footerGroups, legalLinks } from "@/lib/nbc-content";

const socials = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "X", icon: Twitter },
  { label: "LinkedIn", icon: Linkedin },
  { label: "YouTube", icon: Youtube },
];

/**
 * Global NBC footer — dark royal surface, giraffe pattern, grouped links.
 */
export function GlobalFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-nbc-royal-deep text-primary-foreground">
      <GiraffePattern opacity={0.07} />

      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 border-b border-primary-foreground/15 pb-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="min-w-0">
            <NbcLogo variant="card" height={38} />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/75">
              NBC Hospitality connects travellers with verified hotels across Tanzania, backed by
              the trust and payment infrastructure of the National Bank of Commerce.
            </p>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Stay in the know</h2>
            <NewsletterForm tone="onDark" className="mt-4" />
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5"
        >
          {footerGroups.map((group) => (
            <div key={group.title} className="min-w-0">
              <h3 className="nbc-eyebrow text-[0.625rem] text-nbc-gold">{group.title}</h3>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="cursor-pointer text-left text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="grid gap-6 border-t border-primary-foreground/15 pt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0 space-y-4">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    className="cursor-pointer text-xs text-primary-foreground/70 hover:text-primary-foreground"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-primary-foreground/60">
              © {new Date().getFullYear()} National Bank of Commerce. NBC Hospitality. All rights
              reserved.
            </p>
          </div>

          <ul className="flex items-center gap-3">
            {socials.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  aria-label={label}
                  className="grid size-9 cursor-pointer place-items-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-nbc-scarlet hover:border-nbc-scarlet"
                >
                  <Icon aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
