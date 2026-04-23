"use client";

/**
 * app/dashboard/page.tsx
 * -----------------------
 * GHL Custom Page — embedded as an iframe inside GoHighLevel.
 *
 * Flow:
 *  1. On mount, calls window.parent.postMessage to request SSO details
 *  2. GHL injects window.exposeSessionDetails() in the iframe context
 *  3. The encrypted key is POSTed to /api/auth/sso for server-side decryption
 *  4. locationId + userId are used to trigger the generation pipeline
 */

import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SSOSession {
  locationId: string;
  userId: string;
  companyId?: string;
  userName?: string;
  email?: string;
}

interface GenerateResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  funnelCount?: number;
  pageCount?: number;
  redirect?: { path: string; targetUrl: string } | null;
  preview?: string;
  content?: string;
  error?: string;
  details?: string;
}

type Status =
  | "idle"
  | "loading-sso"
  | "ready"
  | "generating"
  | "previewing"
  | "pushing"
  | "done"
  | "error";

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [session, setSession] = useState<SSOSession | null>(null);
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteDomain, setSiteDomain] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── SSO Decryption ─────────────────────────────────────────────────────────

  const decryptSSO = useCallback(async (encryptedKey: string) => {
    setStatus("loading-sso");
    try {
      const resp = await fetch("/api/auth/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: encryptedKey }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.session) throw new Error(data.error ?? "SSO failed");
      setSession(data.session);
      setStatus("ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "SSO decryption failed";
      setErrorMsg(msg);
      setStatus("error");
    }
  }, []);

  // ── Mount: attempt GHL SSO ─────────────────────────────────────────────────

  useEffect(() => {
    // GHL injects exposeSessionDetails into the iframe's window
    const w = window as Window &
      typeof globalThis & {
        exposeSessionDetails?: () => { sessionDetails: { key: string } };
      };

    if (typeof w.exposeSessionDetails === "function") {
      const { sessionDetails } = w.exposeSessionDetails();
      if (sessionDetails?.key) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        decryptSSO(sessionDetails.key);
        return;
      }
    }

    // Fallback: read locationId from query string (dev / direct URL)
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get("locationId");
    if (locationId) {
      setSession({ locationId, userId: "dev-user" });
      setStatus("ready");
      return;
    }

    setErrorMsg(
      "Could not obtain SSO context. Open this page from inside GoHighLevel."
    );
    setStatus("error");
  }, [decryptSSO]);

  // ── Generation Pipeline ────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!session?.locationId || !siteDomain.trim()) return;
    setStatus("generating");
    setResult(null);
    setGeneratedContent("");

    try {
      const resp = await fetch("/api/llms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: session.locationId,
          siteName: siteName.trim(),
          siteDescription: siteDescription.trim() || undefined,
          domainId: siteDomain.trim(),
          baseUrl: siteDomain.trim().startsWith("http")
            ? siteDomain.trim()
            : `https://${siteDomain.trim()}`,
          previewOnly: true,
        }),
      });

      const data: GenerateResult = await resp.json();
      if (data.success && data.content) {
        setGeneratedContent(data.content);
        setResult(data);
        setStatus("previewing");
      } else {
        setErrorMsg(data.error ?? "Generation failed");
        setStatus("error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const handlePushToMedia = async () => {
    if (!session?.locationId || !generatedContent) return;
    setStatus("pushing");

    try {
      const resp = await fetch("/api/llms/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: session.locationId,
          content: generatedContent,
          domainId: siteDomain.trim(),
          baseUrl: siteDomain.trim().startsWith("http")
            ? siteDomain.trim()
            : `https://${siteDomain.trim()}`,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setResult((prev) => (prev ? { ...prev, ...data } : data));
        setStatus("done");
      } else {
        setErrorMsg(data.error ?? "Upload failed");
        setStatus("error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="dashboard-root">
      {/* Header */}
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

      <div className="dash-body">
        {/* ── SSO Loading ───────────────────────────────────────────────── */}
        {status === "loading-sso" && (
          <div className="state-card">
            <div className="spinner" />
            <p className="state-label">Authenticating via GoHighLevel SSO…</p>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {status === "error" && !result && (
          <div className="state-card error-card">
            <span className="state-icon">⚠️</span>
            <p className="state-label">{errorMsg}</p>
            {!session && (
              <a href="/api/auth/ghl" className="btn btn-primary mt-4">
                Re-authorize with GoHighLevel
              </a>
            )}
          </div>
        )}

        {/* ── Ready / Generating ────────────────────────────────── */}
        {(status === "ready" || status === "generating") && (
          <div className="form-card">
            <h2 className="form-title">Generate your llms.txt</h2>
            <p className="form-subtitle">
              We&apos;ll scan all your funnels and pages, build a standards-compliant{" "}
              <code>llms.txt</code> file, upload it to your media library, and
              optionally create a <code>/llms.txt</code> redirect on your domain.
            </p>

              <div className="field">
                <label htmlFor="siteDomain" className="field-label">
                  Site Domain <span className="required">*</span>
                </label>
                <input
                  id="siteDomain"
                  className="field-input"
                  type="text"
                  placeholder="evangrayson.dev"
                  value={siteDomain}
                  onChange={(e) => setSiteDomain(e.target.value)}
                  disabled={status === "generating"}
                />
                <p className="field-hint">
                  We&apos;ll automatically detect your site title and description.
                </p>
              </div>

              <details className="advanced-details">
                <summary>Edit Site Details (Optional)</summary>
                <div className="form-grid pt-4">
                  <div className="field">
                    <label htmlFor="siteName" className="field-label">
                      Site Title
                    </label>
                    <input
                      id="siteName"
                      className="field-input"
                      type="text"
                      placeholder="Custom Title"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      disabled={status === "generating"}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="siteDescription" className="field-label">
                      Site Summary
                    </label>
                    <textarea
                      id="siteDescription"
                      className="field-input field-textarea"
                      placeholder="Override the auto-detected description…"
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      disabled={status === "generating"}
                      rows={2}
                    />
                  </div>
                </div>
              </details>

              <button
                id="generateBtn"
                className={`btn btn-primary btn-lg ${
                  status === "generating" ? "btn-loading" : ""
                }`}
                onClick={handleGenerate}
                disabled={status === "generating" || !siteDomain.trim()}
              >
                {status === "generating" ? (
                  <>
                    <span className="btn-spinner" />
                    Generating…
                  </>
                ) : (
                  "⚡ Generate llms.txt"
                )}
              </button>
            </div>
          )}

        {/* ── Previewing / Pushing ───────────────────────────────────────── */}
        {(status === "previewing" || status === "pushing") && result && (
          <div className="form-card preview-card">
            <h2 className="form-title">Review llms.txt Content</h2>
            <p className="form-subtitle">
              Below is the generated content based on your funnels and pages.
              Review it before pushing it to your site&apos;s media library.
            </p>

            <div className="preview-container">
              <textarea
                className="field-input preview-textarea"
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={12}
                spellCheck={false}
              />
            </div>

            <div className="button-group mt-6">
              <button
                className={`btn btn-primary btn-lg flex-1 ${
                  status === "pushing" ? "btn-loading" : ""
                }`}
                onClick={handlePushToMedia}
                disabled={status === "pushing"}
              >
                {status === "pushing" ? (
                  <>
                    <span className="btn-spinner" />
                    Pushing to Media…
                  </>
                ) : (
                  "🚀 Push to Site Media"
                )}
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  setStatus("ready");
                  setGeneratedContent("");
                }}
                disabled={status === "pushing"}
              >
                Cancel
              </button>
            </div>
          </div>
        )}



        {/* ── Result ────────────────────────────────────────────────────── */}
        {status === "done" && result?.success && (
          <div className="result-card">
            <div className="result-header">
              <span className="result-icon">✅</span>
              <div>
                <h3 className="result-title">llms.txt Generated!</h3>
                <p className="result-sub">
                  Scanned{" "}
                  <strong>{result.funnelCount}</strong> funnels /{" "}
                  <strong>{result.pageCount}</strong> pages
                </p>
              </div>
            </div>

            <div className="result-url-block">
              <span className="result-url-label">Hosted File URL</span>
              <a
                href={result.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="result-url"
              >
                {result.fileUrl}
              </a>
            </div>

            {result.redirect && (
              <div className="result-redirect">
                <span className="redirect-badge">301 Redirect Created</span>
                <code>{result.redirect.path} → {result.redirect.targetUrl}</code>
              </div>
            )}

            {result.preview && (
              <details className="preview-block">
                <summary className="preview-summary">Preview (first 500 chars)</summary>
                <pre className="preview-content">{result.preview}</pre>
              </details>
            )}

            <button
              className="btn btn-secondary mt-4"
              onClick={() => {
                setStatus("ready");
                setResult(null);
              }}
            >
              Generate Again
            </button>
          </div>
        )}

        {/* ── Error after generation attempt ───────────────────────────── */}
        {status === "error" && result && (
          <div className="state-card error-card">
            <span className="state-icon">❌</span>
            <p className="state-label">{result.error}</p>
            {result.details && (
              <pre className="error-details">{result.details}</pre>
            )}
            <button
              className="btn btn-secondary mt-4"
              onClick={() => {
                setStatus("ready");
                setResult(null);
                setErrorMsg("");
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
