import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";

export function PromoCard() {
  const services = [
    "GoHighLevel SaaS Configurator",
    "Build & Configure industry-specific Snapshots",
    "Build Voice and Conversation Agents",
    "White-label technical support",
    "Custom App Development / Integration",
    "Migrate from other CRM to GoHighLevel",
  ];

  return (
    <Card className="w-full border-primary/10 bg-card/50 shadow-md">
      <CardContent className="p-6 flex flex-col gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Done-For-You GHL Services
          </span>
          <h3 className="text-xl font-bold tracking-tight text-foreground mt-4">
            GoHighLevel CRM Services
          </h3>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            We configure, automate, and support your GoHighLevel CRM, workflows,
            and custom integrations so you can scale your agency or business
            without technical headaches.
          </p>
        </div>

        <ul className="space-y-3.5">
          {services.map((service, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-foreground/90"
            >
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/15 text-blue-400 shrink-0 mt-0.5">
                <Check className="h-3 w-3 stroke-3" />
              </span>
              <span className="leading-tight">{service}</span>
            </li>
          ))}
        </ul>

        <a
          href="https://zeon.studio/gohighlevel-expert-services?ref=hl-llms-txt-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 border border-neutral-800 dark:border-neutral-800 text-white rounded-full py-3 px-5 text-sm font-semibold transition-all group shadow-xs"
        >
          <span>Hire GoHighLevel Experts</span>
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-800 dark:bg-neutral-800 group-hover:bg-neutral-700 transition-colors">
            <ArrowRight className="h-4 w-4" />
          </span>
        </a>
      </CardContent>
    </Card>
  );
}
