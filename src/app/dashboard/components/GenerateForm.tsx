import { useState } from "react";
import { Status } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Loader2 } from "lucide-react";

interface GenerateFormProps {
  status: Status;
  siteDomain: string;
  setSiteDomain: (val: string) => void;
  siteName: string;
  setSiteName: (val: string) => void;
  siteDescription: string;
  setSiteDescription: (val: string) => void;
  onGenerate: () => void;
}

export function GenerateForm({
  status,
  siteDomain,
  setSiteDomain,
  siteName,
  setSiteName,
  siteDescription,
  setSiteDescription,
  onGenerate,
}: GenerateFormProps) {
  const isGenerating = status === "generating";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate your llms.txt</CardTitle>
        <CardDescription>
          We&apos;ll scan all your funnels and pages, build a standards-compliant{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">llms.txt</code> file, upload it to your media library, and
          optionally create a <code className="bg-muted px-1 py-0.5 rounded text-xs">/llms.txt</code> redirect on your domain.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="siteDomain">
            Site Domain <span className="text-destructive">*</span>
          </Label>
          <Input
            id="siteDomain"
            type="text"
            placeholder="example.com"
            value={siteDomain}
            onChange={(e) => setSiteDomain(e.target.value)}
            disabled={isGenerating}
          />
          <p className="text-sm text-muted-foreground">
            We&apos;ll automatically detect your site title and description.
          </p>
        </div>

        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full rounded-md border bg-muted/10"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-sm font-medium transition-colors hover:bg-muted/20 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring rounded-t-md data-[state=closed]:rounded-b-md cursor-pointer">
            <span>Edit Site Details (Optional)</span>
            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Title</Label>
                <Input
                  id="siteName"
                  type="text"
                  placeholder="Custom Title"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  disabled={isGenerating}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Summary</Label>
                <Textarea
                  id="siteDescription"
                  placeholder="Override the auto-detected description…"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  disabled={isGenerating}
                  rows={2}
                  className="resize-none bg-background"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full sm:w-auto"
          size="lg"
          onClick={onGenerate}
          disabled={isGenerating || !siteDomain.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            "⚡ Generate llms.txt"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
