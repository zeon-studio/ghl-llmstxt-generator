import { Status, GenerateResult } from "../types";

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
          className={`btn btn-primary btn-lg flex-1 ${isPushing ? "btn-loading" : ""}`}
          onClick={onPush}
          disabled={isPushing}
        >
          {isPushing ? (
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
          onClick={onCancel}
          disabled={isPushing}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
