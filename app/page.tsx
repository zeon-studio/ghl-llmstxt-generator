import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GHL llms.txt Plugin – AI-Ready Pages for GoHighLevel",
  description:
    "Automatically scan your GoHighLevel funnels, generate a standards-compliant llms.txt file, and make your pages discoverable by AI assistants.",
};

export default function LandingPage() {
  return (
    <main className="landing-root">
      <div className="landing-inner">
        {/* Badge */}
        <span className="landing-badge">
          <img
            src="/icon.png"
            alt=""
            style={{ width: "16px", height: "16px", borderRadius: "2px" }}
          />
          GoHighLevel Marketplace App
        </span>

        {/* Title */}
        <h1 className="landing-title">
          Make your GHL site
          <br />
          <span className="highlight">AI-ready in seconds</span>
        </h1>

        {/* Description */}
        <p className="landing-desc">
          This plugin scans all your GoHighLevel funnels and pages, generates a
          standards-compliant <code>llms.txt</code> file following{" "}
          <a
            href="https://llmstxt.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            llmstxt.org
          </a>
          , and hosts it automatically in your media library.
        </p>

        {/* CTAs */}
        <div className="landing-actions">
          <a
            href="/api/auth/ghl"
            className="btn btn-primary btn-lg"
            style={{ width: "auto", padding: "0.9rem 2rem" }}
          >
            Connect GoHighLevel
          </a>
          <Link
            href="/dashboard"
            className="btn btn-secondary"
            style={{ padding: "0.9rem 2rem" }}
          >
            Open Dashboard
          </Link>
        </div>

        {/* Steps */}
        <div className="landing-steps">
          {[
            {
              n: 1,
              title: "Connect your sub-account",
              desc: "OAuth 2.0 authorization — no passwords stored.",
            },
            {
              n: 2,
              title: "Scan funnels & pages",
              desc: "We automatically discover all active pages across your funnels.",
            },
            {
              n: 3,
              title: "Generate llms.txt",
              desc: "Structured markdown following the open llmstxt.org specification.",
            },
            {
              n: 4,
              title: "Auto-host & redirect",
              desc: "Uploaded to GHL Media Storage with a /llms.txt 301 redirect.",
            },
          ].map(({ n, title, desc }) => (
            <div key={n} className="step">
              <div className="step-num">{n}</div>
              <div className="step-text">
                <strong>{title}</strong>
                {desc}
              </div>
            </div>
          ))}
        </div>

        <p className="landing-footer">
          Requires GoHighLevel sub-account access · No data stored on our
          servers
        </p>

        <footer
          style={{
            marginTop: "4rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "2rem",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            fontSize: "0.8rem",
            color: "var(--text-dim)",
          }}
        >
          <Link href="/privacy" style={{ color: "inherit" }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ color: "inherit" }}>
            Terms of Service
          </Link>
          <span>© 2026 GHL llms.txt Plugin</span>
        </footer>
      </div>
    </main>
  );
}
