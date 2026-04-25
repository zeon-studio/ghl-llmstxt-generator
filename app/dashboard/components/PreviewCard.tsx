import { Status, GenerateResult } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PreviewCardProps {
  status: Status;
  result: GenerateResult | null;
  generatedContent: string;
  setGeneratedContent: (val: string) => void;
  onPush: () => void;
  onCancel: () => void;
}

export function PreviewCard({
  status,
  result,
  generatedContent,
  setGeneratedContent,
  onPush,
  onCancel,
}: PreviewCardProps) {
  if (!result) return null;
  const isPushing = status === "pushing";

  return (
    <Card className="w-full border-primary/20 shadow-md">
      <CardHeader>
        <CardTitle>Review llms.txt Content</CardTitle>
        <CardDescription>
          Below is the generated content based on your funnels and pages.
          Review it before pushing it to your site&apos;s media library.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Textarea
          className="font-mono text-sm bg-muted/50 resize-none"
          value={generatedContent}
          onChange={(e) => setGeneratedContent(e.target.value)}
          rows={12}
          spellCheck={false}
        />
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          className="w-full sm:flex-1"
          size="lg"
          onClick={onPush}
          disabled={isPushing}
        >
          {isPushing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Pushing to Media…
            </>
          ) : (
            "🚀 Push to Site Media"
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          size="lg"
          onClick={onCancel}
          disabled={isPushing}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
