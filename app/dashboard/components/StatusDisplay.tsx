import { Status, GHLSession } from "../types";

interface StatusDisplayProps {
  status: Status;
  errorMsg: string;
  session: GHLSession | null;
  onRetry?: () => void;
}

export function StatusDisplay({ status, errorMsg, session, onRetry }: StatusDisplayProps) {


  if (status === "error" && !onRetry) {
    return (
      <div className="state-card error-card">
        <span className="state-icon">⚠️</span>
        <p className="state-label">{errorMsg}</p>
        {!session && (
          <a href="/api/auth/ghl" className="btn btn-primary mt-4">
            Re-authorize with GoHighLevel
          </a>
        )}
      </div>
    );
  }

  return null;
}
