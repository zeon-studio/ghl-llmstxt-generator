import { SSOSession } from "../types";

export function DashboardHeader({ session }: { session: SSOSession | null }) {
  return (
    <header className="dash-header">
      <div className="dash-logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">llms.txt Generator</span>
      </div>
      {session && (
        <div className="dash-badge">
          <span className="badge-dot" />
          <span>{session.locationId}</span>
        </div>
      )}
    </header>
  );
}
