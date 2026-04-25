import { GHLSession } from "../types";

export function DashboardHeader({ session }: { session: GHLSession | null }) {
  return (
    <header className="dash-header">
      <div className="dash-logo">
        <img
          src="/icon.png"
          alt="llms.txt"
          style={{ width: "24px", height: "24px", borderRadius: "4px" }}
        />
        <span className="logo-text">llms.txt Generator</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {session && (
          <div className="dash-badge">
            <span className="badge-dot" />
            <span>{session.locationId}</span>
          </div>
        )}
        <a
          href="mailto:themefisher@gmail.com"
          style={{
            fontSize: "0.8rem",
            color: "var(--text-dim)",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span style={{ fontSize: "1rem" }}>📧</span> Support
        </a>
      </div>
    </header>
  );
}
