import { Status } from "../types";

interface GenerateFormProps {
  status: Status;
  siteDomain: string;
  setSiteDomain: (val: string) => void;
  siteName: string;
  setSiteName: (val: string) => void;
  siteDescription: string;
  setSiteDescription: (val: string) => void;
  onGenerate: () => void;
}

export function GenerateForm({
  status,
  siteDomain,
  setSiteDomain,
  siteName,
  setSiteName,
  siteDescription,
  setSiteDescription,
  onGenerate,
}: GenerateFormProps) {
  const isGenerating = status === "generating";

  return (
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
          disabled={isGenerating}
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
              disabled={isGenerating}
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
              disabled={isGenerating}
              rows={2}
            />
          </div>
        </div>
      </details>

      <button
        id="generateBtn"
        className={`btn btn-primary btn-lg ${isGenerating ? "btn-loading" : ""}`}
        onClick={onGenerate}
        disabled={isGenerating || !siteDomain.trim()}
      >
        {isGenerating ? (
          <>
            <span className="btn-spinner" />
            Generating…
          </>
        ) : (
          "⚡ Generate llms.txt"
        )}
      </button>
    </div>
  );
}
