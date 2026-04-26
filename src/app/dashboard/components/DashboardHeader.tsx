import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GHLSession } from "../types";

export function DashboardHeader({ session }: { session: GHLSession | null }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-8 py-3 flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <Image
          src="/icon.png"
          alt="LLMS.txt Generator"
          width={32}
          height={32}
          className="w-8 h-8 rounded-md shadow-sm"
        />
        <span className="font-semibold text-lg hidden sm:inline-block tracking-tight">
          LLMS.txt Generator
        </span>
      </Link>
      <div className="flex items-center gap-4">
        {session && (
          <Badge
            variant="outline"
            className="hidden sm:flex gap-1.5 px-3 py-1 bg-muted/50 font-mono text-[10px] uppercase tracking-wider"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {session.locationName || session.locationId}
          </Badge>
        )}
        <a
          href="mailto:zeonstudiohg@gmail.com"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline-block">Support</span>
        </a>
        <ModeToggle />
      </div>
    </header>
  );
}
