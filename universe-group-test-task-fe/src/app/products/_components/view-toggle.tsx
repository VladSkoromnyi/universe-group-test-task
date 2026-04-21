"use client";

import { LayoutGridIcon, ListIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { buildProductsHref, type ViewMode } from "./search-params";

type Props = {
  page: number;
  view: ViewMode;
};

/**
 * Two-button toggle rendered as `Link`s so the view mode ends up in the URL
 * (shareable, survives refresh) and back/forward works as expected.
 */
export function ViewToggle({ page, view }: Props) {
  return (
    <div
      role="group"
      aria-label="Toggle view"
      className="bg-muted/40 inline-flex items-center gap-1 rounded-md border p-0.5"
    >
      <ToggleItem
        href={buildProductsHref({ page, view: "grid" })}
        active={view === "grid"}
        label="Grid view"
      >
        <LayoutGridIcon className="size-4" />
      </ToggleItem>
      <ToggleItem
        href={buildProductsHref({ page, view: "list" })}
        active={view === "list"}
        label="List view"
      >
        <ListIcon className="size-4" />
      </ToggleItem>
    </div>
  );
}

function ToggleItem({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-pressed={active}
      // Replace keeps the history stack clean — switching views shouldn't
      // pollute back-button behaviour.
      replace
      scroll={false}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex h-8 w-8 items-center justify-center rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
        active
          ? "bg-background text-foreground shadow-xs"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
