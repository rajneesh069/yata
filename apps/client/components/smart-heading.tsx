"use client";

import { useSidebar } from "@workspace/ui/components/sidebar";
import Link from "next/link";

export function SmartHeading() {
  const { open } = useSidebar();
  if (open) return null;
  return (
    <Link href="/">
      <h1 className="text-3xl font-bold tracking-tight">YATA</h1>
      <p className="text-xs leading-tight text-muted-foreground">
        Yet Another Ticketing App
      </p>
    </Link>
  );
}
