import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | LLMS.txt Generator",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-8 pt-16 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-3xl w-full flex flex-col items-start text-left z-10">
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", className: "mb-8" })}
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Privacy <span className="text-primary">Policy</span>
        </h1>

        <div className="text-muted-foreground w-full space-y-6">
          <p className="font-medium text-foreground">Last Updated: April 25, 2026</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            1. Introduction
          </h2>
          <p>
            This Privacy Policy explains how we collect, use, and protect your
            information when you use the LLMS.txt Generator. We are committed
            to ensuring that your privacy is protected and that we comply with
            all relevant data protection laws.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            2. Information We Collect
          </h2>
          <p>
            To provide our services, we may collect the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong className="text-foreground">GoHighLevel Account Information:</strong> When you connect
              your sub-account, we receive an OAuth token and basic location
              details (ID, name).
            </li>
            <li>
              <strong className="text-foreground">Usage Data:</strong> We may collect metadata about the
              llms.txt files generated, such as timestamps and domain names.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            3. How We Use Your Information
          </h2>
          <p>
            We use your information exclusively to facilitate the generation,
            hosting, and management of llms.txt files within your GoHighLevel
            account.
            <strong className="text-foreground"> We do not sell your data to third parties.</strong>
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            4. Data Storage
          </h2>
          <p>
            As stated in our landing page, we prioritize a
            &quot;no-data-stored&quot; approach where possible. Your GoHighLevel
            session tokens are stored securely in our database to allow the
            application to function inside the GHL iframe. You can revoke access
            at any time through the GoHighLevel marketplace.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at zeonstudiohg@gmail.com.
          </p>
        </div>
      </div>
    </main>
  );
}
