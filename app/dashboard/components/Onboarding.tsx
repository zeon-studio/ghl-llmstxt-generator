"use client";

import { useState } from "react";

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      className="form-card"
      style={{
        border: "1px solid var(--brand)",
        background: "rgba(108,71,255,0.05)",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <h2
          className="form-title"
          style={{
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <img
            src="/icon.png"
            alt=""
            style={{ width: "20px", height: "20px", borderRadius: "3px" }}
          />
          Quick Start Guide
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
        >
          ×
        </button>
      </div>

      <div className="landing-steps" style={{ marginTop: 0 }}>
        {[
          {
            n: "1",
            title: "Select Your Domain",
            desc: "Choose the domain where your funnels are hosted. We'll use this to scan for pages.",
          },
          {
            n: "2",
            title: "Review & Generate",
            desc: "Fill in your site name and description. We'll automatically find all your pages and format them for AI discovery.",
          },
          {
            n: "3",
            title: "Push to Media Library",
            desc: "Once generated, we'll upload the file to your GHL Media Storage and create a /llms.txt redirect automatically.",
          },
        ].map((step) => (
          <div
            key={step.n}
            className="step"
            style={{ padding: "0.75rem 1rem", background: "var(--surface-2)" }}
          >
            <div
              className="step-num"
              style={{
                width: "24px",
                height: "24px",
                minWidth: "24px",
                fontSize: "0.7rem",
              }}
            >
              {step.n}
            </div>
            <div className="step-text" style={{ fontSize: "0.8rem" }}>
              <strong>{step.title}</strong>
              {step.desc}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: "1rem",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        AI agents like ChatGPT and Claude look for <code>/llms.txt</code> to
        understand your site better.
      </p>
    </div>
  );
}
