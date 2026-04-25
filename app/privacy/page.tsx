import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | GHL llms.txt Plugin",
};

export default function PrivacyPage() {
  return (
    <main
      className="landing-root"
      style={{ justifyContent: "flex-start", paddingTop: "4rem" }}
    >
      <div
        className="landing-inner"
        style={{
          textAlign: "left",
          alignItems: "flex-start",
          maxWidth: "800px",
        }}
      >
        <Link
          href="/"
          className="btn btn-secondary"
          style={{ marginBottom: "2rem" }}
        >
          ← Back to Home
        </Link>

        <h1
          className="landing-title"
          style={{
            fontSize: "2.5rem",
            textAlign: "left",
            marginBottom: "1rem",
          }}
        >
          Privacy <span className="highlight">Policy</span>
        </h1>

        <div
          className="landing-desc"
          style={{ maxWidth: "none", color: "var(--text)" }}
        >
          <p style={{ marginBottom: "1.5rem" }}>Last Updated: April 25, 2026</p>

          <h2
            style={{
              color: "var(--brand-light)",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            1. Introduction
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            This Privacy Policy explains how we collect, use, and protect your
            information when you use the GHL llms.txt Plugin. We are committed
            to ensuring that your privacy is protected and that we comply with
            all relevant data protection laws.
          </p>

          <h2
            style={{
              color: "var(--brand-light)",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            2. Information We Collect
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            To provide our services, we may collect the following information:
          </p>
          <ul
            style={{
              paddingLeft: "1.5rem",
              marginBottom: "1.5rem",
              color: "var(--text-muted)",
            }}
          >
            <li>
              <strong>GoHighLevel Account Information:</strong> When you connect
              your sub-account, we receive an OAuth token and basic location
              details (ID, name).
            </li>
            <li>
              <strong>Usage Data:</strong> We may collect metadata about the
              llms.txt files generated, such as timestamps and domain names.
            </li>
          </ul>

          <h2
            style={{
              color: "var(--brand-light)",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            3. How We Use Your Information
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            We use your information exclusively to facilitate the generation,
            hosting, and management of llms.txt files within your GoHighLevel
            account.
            <strong>We do not sell your data to third parties.</strong>
          </p>

          <h2
            style={{
              color: "var(--brand-light)",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            4. Data Storage
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            As stated in our landing page, we prioritize a
            &quot;no-data-stored&quot; approach where possible. Your GoHighLevel
            session tokens are stored securely in our database to allow the
            application to function inside the GHL iframe. You can revoke access
            at any time through the GoHighLevel marketplace.
          </p>

          <h2
            style={{
              color: "var(--brand-light)",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            5. Contact Us
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            If you have any questions about this Privacy Policy, please contact
            us at themefisher@gmail.com.
          </p>
        </div>
      </div>
    </main>
  );
}
