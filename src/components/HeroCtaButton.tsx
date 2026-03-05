import * as React from "react";
import { Button } from "@/components/ui/button";

interface HeroCtaButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function HeroCtaButton({ href, children }: HeroCtaButtonProps) {
  return (
    <Button asChild size="lg" className="mt-8 sm:mt-10 rounded-lg border-transparent bg-[#f43f5e] px-5 py-2.5 text-white hover:bg-[#e11d48] sm:px-6 sm:py-3" variant="default">
      <a href={href}>{children}</a>
    </Button>
  );
}
