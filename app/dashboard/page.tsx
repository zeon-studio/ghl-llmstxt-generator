"use client";

/**
 * app/dashboard/page.tsx
 * -----------------------
 * GHL Custom Page — embedded as an iframe inside GoHighLevel.
 */

import { useEffect, useState } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { GenerateForm } from "./components/GenerateForm";
import { PreviewCard } from "./components/PreviewCard";
import { ResultCard } from "./components/ResultCard";
import { StatusDisplay } from "./components/StatusDisplay";
import { GenerateResult, GHLSession, Status } from "./types";

export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [session, setSession] = useState<GHLSession | null>(null);
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteDomain, setSiteDomain] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Mount: attempt GHL SSO ─────────────────────────────────────────────────

  useEffect(() => {
    // Read locationId from query string (passed by GHL iframe)
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get("locationId");

    if (locationId) {
      const timer = setTimeout(() => {
        setSession({ locationId, userId: "user" });
        setStatus("ready");
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setErrorMsg(
        "Could not obtain location context. Ensure the page is opened from within GoHighLevel.",
      );
      setStatus("error");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
        setResult(data);
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
        setResult(data);
        setErrorMsg(data.error ?? "Upload failed");
        setStatus("error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const resetPipeline = () => {
    setStatus("ready");
    setResult(null);
    setGeneratedContent("");
    setErrorMsg("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="dashboard-root">
      <DashboardHeader session={session} />

      <div className="dash-body">
        <StatusDisplay status={status} errorMsg={errorMsg} session={session} />

        {(status === "ready" || status === "generating") && (
          <GenerateForm
            status={status}
            siteDomain={siteDomain}
            setSiteDomain={setSiteDomain}
            siteName={siteName}
            setSiteName={setSiteName}
            siteDescription={siteDescription}
            setSiteDescription={setSiteDescription}
            onGenerate={handleGenerate}
          />
        )}

        {(status === "previewing" || status === "pushing") && (
          <PreviewCard
            status={status}
            result={result}
            generatedContent={generatedContent}
            setGeneratedContent={setGeneratedContent}
            onPush={handlePushToMedia}
            onCancel={resetPipeline}
          />
        )}

        <ResultCard
          status={status}
          result={result}
          errorMsg={errorMsg}
          onReset={resetPipeline}
        />
      </div>
    </main>
  );
}
