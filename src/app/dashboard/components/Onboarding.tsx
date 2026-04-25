"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const steps = [
    {
      n: "1",
      title: "Select Your Domain",
      desc: "Choose the domain where your funnels are hosted. We'll use this to scan for pages.",
    },
    {
      n: "2",
      title: "Review & Generate",
      desc: "Fill in your site name and description. We'll automatically find all your pages and format them for AI discovery.",
    },
    {
      n: "3",
      title: "Push to Media Library",
      desc: "Once generated, we'll upload the file to your GHL Media Storage and create a /llms.txt redirect automatically.",
    },
  ];

  return (
    <Card className="w-full relative overflow-hidden border-primary/20 bg-primary/5 shadow-sm">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/40 via-primary to-primary/40" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Quick Start Guide
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3 mt-2">
          {steps.map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-2 p-4 rounded-lg bg-background/60 border border-primary/10 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {step.n}
                </div>
                <h3 className="font-semibold text-sm leading-none">
                  {step.title}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-center text-muted-foreground bg-background/40 py-2 rounded-md border border-primary/5">
          AI agents like ChatGPT and Claude look for{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-primary">
            /llms.txt
          </code>{" "}
          to understand your site better.
        </p>
      </CardContent>
    </Card>
  );
}
