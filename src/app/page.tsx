import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export const metadata: Metadata = {
  title: "LLMS.txt Generator – AI-Ready Pages for Your CRM",
  description:
    "Automatically scan your CRM funnels, generate a standards-compliant llms.txt file, and make your pages discoverable by AI assistants.",
};

const STEPS = [
  {
    n: 1,
    title: "Connect your sub-account",
    desc: "OAuth 2.0 authorization — no passwords stored.",
  },
  {
    n: 2,
    title: "Scan funnels & pages",
    desc: "We automatically discover all active pages across your funnels.",
  },
  {
    n: 3,
    title: "Generate llms.txt",
    desc: "Structured markdown following the open https://llmstxt.org specification.",
  },
  {
    n: 4,
    title: "Auto-host & redirect",
    desc: "Uploaded to your Media Storage with a /llms.txt 301 redirect.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center text-center gap-8 z-10">
        <Badge
          variant="secondary"
          className="gap-2 px-3 py-1 text-sm font-medium"
        >
          <Image
            src="/icon.png"
            alt="LLMS.txt Generator"
            width={16}
            height={16}
            style={{ borderRadius: "2px" }}
          />
          Marketplace App
        </Badge>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Make your website <br className="hidden sm:inline" />
          <span className="text-primary">AI-ready in seconds</span>
        </h1>

        <p className="text-muted-foreground text-lg max-w-lg">
          This generator scans all your funnels and pages, generates a
          standards-compliant <code>llms.txt</code> file following{" "}
          <a
            href="https://llmstxt.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline underline-offset-4"
          >
            llmstxt.org
          </a>
          , and hosts it automatically in your media library.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/api/auth/ghl"
            className={buttonVariants({
              size: "lg",
              className: "px-8 font-semibold",
            })}
          >
            Connect Platform
          </a>
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "px-8 font-semibold",
            })}
          >
            Open Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
          {STEPS.map(({ n, title, desc }) => (
            <Card
              key={n}
              className="text-left border-muted bg-card hover:border-primary/50 transition-colors"
            >
              <CardHeader className="p-5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {n}
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {title}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm">{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Requires platform sub-account access · No data stored on our
          servers
        </p>

        <footer className="mt-16 w-full flex items-center justify-center gap-6 pt-8 border-t text-sm text-muted-foreground">
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <span>© 2026 Zeon Studio</span>
        </footer>
      </div>
    </main>
  );
}
