import { Status, GHLSession } from "../types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface StatusDisplayProps {
  status: Status;
  errorMsg: string;
  session: GHLSession | null;
  onRetry?: () => void;
}

export function StatusDisplay({ status, errorMsg, session, onRetry }: StatusDisplayProps) {

  if (status === "error" && !onRetry) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4 mt-2">
          <p>{errorMsg}</p>
          {!session && (
            <a 
              href="/api/auth/ghl" 
              className={buttonVariants({ variant: "outline", className: "w-fit border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" })}
            >
              Re-authorize with Platform
            </a>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
