import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Status } from "../types";

interface GHLDomain {
  id: string;
  domainName: string;
}

interface GenerateFormProps {
  status: Status;
  locationId: string | null;
  siteDomain: string;
  setSiteDomain: (val: string) => void;
  onGenerate: () => void;
}

export function GenerateForm({
  status,
  locationId,
  siteDomain,
  setSiteDomain,
  onGenerate,
}: GenerateFormProps) {
  const isGenerating = status === "generating";

  const [domains, setDomains] = useState<GHLDomain[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [domainsError, setDomainsError] = useState<string | null>(null);
  // When no domains are found, fall back to manual input
  const [manualMode, setManualMode] = useState(false);

  const loadDomains = async () => {
    if (!locationId) return;
    setDomainsLoading(true);
    setDomainsError(null);

    try {
      const res = await fetch(
        `/api/llms/domains?locationId=${encodeURIComponent(locationId)}`,
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.domains)) {
        setDomains(data.domains);
        if (data.domains.length === 0) {
          // No connected domains → fall back to manual entry
          setManualMode(true);
        } else {
          setManualMode(false);
          // Auto-select the first domain if nothing is selected yet
          if (!siteDomain && data.domains.length > 0) {
            setSiteDomain(data.domains[0].domainName);
          }
        }
      } else {
        setDomainsError(data.error ?? "Failed to load domains");
        setManualMode(true);
      }
    } catch {
      setDomainsError("Network error while fetching domains");
      setManualMode(true);
    } finally {
      setDomainsLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      loadDomains();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  const showManualInput = manualMode || domains.length === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate your llms.txt</CardTitle>
        <CardDescription>
          We&apos;ll scan all your funnels and pages, build a
          standards-compliant{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">llms.txt</code>{" "}
          file, upload it to your media library, and optionally create a{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">
            /llms.txt
          </code>{" "}
          redirect on your domain.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="siteDomain">
            Site Domain <span className="text-destructive">*</span>
          </Label>

          {domainsLoading ? (
            <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/20 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading connected domains…
            </div>
          ) : showManualInput ? (
            <div className="space-y-2">
              <Input
                id="siteDomain"
                type="text"
                placeholder="example.com"
                value={siteDomain}
                onChange={(e) => setSiteDomain(e.target.value)}
                disabled={isGenerating}
              />
              <div className="flex justify-between items-center">
                {domainsError ? (
                  <p className="text-xs text-amber-500">
                    {domainsError} — enter your domain manually.
                  </p>
                ) : domains.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No connected domains found — enter your domain manually.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setManualMode(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    Select from connected domains
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Select
                value={siteDomain}
                onValueChange={(val) => setSiteDomain(val ?? "")}
                disabled={isGenerating}
              >
                <SelectTrigger id="siteDomain" className="w-full">
                  <SelectValue placeholder="Select a domain…" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((d) => (
                    <SelectItem key={d.id} value={d.domainName}>
                      {d.domainName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setManualMode(true)}
                  className="text-xs cursor-pointer text-primary hover:underline"
                >
                  Enter domain manually
                </button>
              </div>
            </div>
          )}
        </div>
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
