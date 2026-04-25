import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { GenerateResult, Status } from "../types";

interface ResultCardProps {
  status: Status;
  result: GenerateResult | null;
  errorMsg: string;
  onReset: () => void;
  siteDomain?: string;
}

export function ResultCard({
  status,
  result,
  errorMsg,
  onReset,
  siteDomain,
}: ResultCardProps) {
  if (status === "done" && result?.success) {
    // Ensure domain has correct scheme for link
    const domainLink = siteDomain
      ? siteDomain.startsWith("http")
        ? siteDomain
        : `https://${siteDomain}`
      : "";

    return (
      <Card className="w-full border-green-500/20 bg-green-50/50 dark:bg-green-950/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          <div>
            <CardTitle className="text-green-700 dark:text-green-400">
              llms.txt Generated!
            </CardTitle>
            <CardDescription>
              Scanned <strong>{result.funnelCount}</strong> funnels /{" "}
              <strong>{result.pageCount}</strong> pages
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Hosted File */}
          <div className="rounded-lg bg-background border p-4 space-y-2">
            <span className="text-sm font-medium text-muted-foreground block">
              Hosted File URL
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={result.fileUrl}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs font-mono shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button size="icon" variant="outline" className="shrink-0">
                <a
                  href={result.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open hosted file"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Redirect Info */}
          {result.redirect && (
            <div className="rounded-lg bg-background border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  301 Redirect Created
                </Badge>
              </div>

              <div className="text-xs font-mono bg-muted p-2 rounded break-all text-muted-foreground">
                {result.redirect.path} → {result.redirect.targetUrl}
              </div>

              {domainLink && (
                <div className="pt-2">
                  <a
                    href={`${domainLink}/llms.txt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Check your redirect at{" "}
                    {siteDomain?.replace(/^https?:\/\//, "")}/llms.txt
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onReset}
          >
            Generate Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (status === "error" && result) {
    return (
      <Card className="w-full border-destructive/50 bg-destructive/5">
        <CardHeader className="flex flex-col items-center text-center space-y-2 pb-4">
          <XCircle className="w-10 h-10 text-destructive mb-2" />
          <CardTitle className="text-destructive">Error occurred</CardTitle>
          <CardDescription className="text-base text-foreground">
            {result.error || errorMsg}
          </CardDescription>
        </CardHeader>

        {result.details && (
          <CardContent>
            <pre className="text-xs bg-destructive/10 text-destructive-foreground p-4 rounded-md overflow-x-auto">
              {result.details}
            </pre>
          </CardContent>
        )}

        <CardFooter className="justify-center">
          <Button variant="destructive" onClick={onReset}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}
