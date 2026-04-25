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
}

export function ResultCard({
  status,
  result,
  errorMsg,
  onReset,
}: ResultCardProps) {
  if (status === "done" && result?.success) {
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
          <div className="rounded-lg bg-background border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Hosted File URL
            </span>
            <a
              href={result.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium text-sm flex items-center gap-1 break-all"
            >
              {result.fileUrl}
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>

          {result.redirect && (
            <div className="rounded-lg bg-background border p-4 space-y-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                301 Redirect Created
              </Badge>
              <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                {result.redirect.path} → {result.redirect.targetUrl}
              </div>
            </div>
          )}

          {result.preview && (
            <details className="group rounded-lg border bg-background [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-medium text-muted-foreground">
                Preview (first 500 chars)
                <span className="transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="border-t p-4 bg-muted/30">
                <pre className="text-xs font-mono whitespace-pre-wrap wrap-break-word">
                  {result.preview}
                </pre>
              </div>
            </details>
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
