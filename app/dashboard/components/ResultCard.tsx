import { Status, GenerateResult } from "../types";

interface ResultCardProps {
  status: Status;
  result: GenerateResult | null;
  errorMsg: string;
  onReset: () => void;
}

export function ResultCard({ status, result, errorMsg, onReset }: ResultCardProps) {
  if (status === "done" && result?.success) {
    return (
      <div className="result-card">
        <div className="result-header">
          <span className="result-icon">✅</span>
          <div>
            <h3 className="result-title">llms.txt Generated!</h3>
            <p className="result-sub">
              Scanned <strong>{result.funnelCount}</strong> funnels /{" "}
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
            <code>
              {result.redirect.path} → {result.redirect.targetUrl}
            </code>
          </div>
        )}

        {result.preview && (
          <details className="preview-block">
            <summary className="preview-summary">Preview (first 500 chars)</summary>
            <pre className="preview-content">{result.preview}</pre>
          </details>
        )}

        <button className="btn btn-secondary mt-4" onClick={onReset}>
          Generate Again
        </button>
      </div>
    );
  }

  if (status === "error" && result) {
    return (
      <div className="state-card error-card">
        <span className="state-icon">❌</span>
        <p className="state-label">{result.error || errorMsg}</p>
        {result.details && <pre className="error-details">{result.details}</pre>}
        <button className="btn btn-secondary mt-4" onClick={onReset}>
          Try Again
        </button>
      </div>
    );
  }

  return null;
}
