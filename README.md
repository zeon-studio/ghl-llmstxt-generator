# LLMS.txt Generator for GHL

Automatically generate and host a standards-compliant `llms.txt` file (following [llmstxt.org](https://llmstxt.org)) for your GoHighLevel sub-accounts. Make your funnels and pages discoverable by AI assistants like ChatGPT, Claude, and Perplexity in seconds.

## 🚀 Features

- **Official llms.txt Support:** Full compliance with the [llmstxt.org](https://llmstxt.org) specification.
- **OAuth 2.0 Integration:** Secure connection to GHL sub-accounts using the official `@gohighlevel/api-client`.
- **Automated Discovery:** Deep-scans all funnels and pages within a location.
- **Automatic Hosting:** Uploads the generated file directly to the GHL Media Library.
- **Instant Redirects:** Automatically creates a `/llms.txt` 301 redirect on your custom domain.
- **SSO Dashboard:** Deeply integrated into the GHL UI as a Custom Page with built-in onboarding.
- **Supabase Persistence:** Reliable session and token management.

---

## 🛠 Setup & Installation

### 1. Prerequisites
- A GoHighLevel Developer Account.
- A Supabase Project (for session storage).
- An app created in the [GHL Marketplace](https://marketplace.gohighlevel.com/).

### 2. Environment Variables
Create a `.env` file in the root directory (use `.env.example` as a template):

```env
# GHL API Keys
GHL_CLIENT_ID="your_client_id"
GHL_CLIENT_SECRET="your_client_secret"
GHL_REDIRECT_URI="http://localhost:3000/api/auth/callback"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

### 3. Database Setup
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Copy the contents of `supabase_schema.sql` (found in the root of this project).
3. Run the script to create the `sessions` table.

### 4. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🧪 Testing the App

### Manual Testing (Local)
1. **Initialize OAuth:** Open `http://localhost:3000` and click **"Connect GoHighLevel"**.
2. **Authorize:** Select a GHL sub-account and authorize the app.
3. **Dashboard Access:** After redirect, you'll land on `/dashboard`.
4. **Generate:** Enter a Site Name and click **"Generate llms.txt"**.
5. **Verify:** Check your GHL Media Library for the new `llms.txt` file and verify the redirect in your domain settings.

### GHL Iframe Testing (SSO)
To test the SSO logic inside the GHL UI:
1. Go to your **GHL Marketplace App Settings**.
2. Set the **Iframe URL** to `http://localhost:3000/dashboard`.
3. Open a GHL Sub-account → **Settings** → **Custom Pages**.
4. Launch your app. The dashboard will automatically detect your `locationId` via query parameters.

---

## 📦 Publishing to Marketplace

Follow the [Publishing Guide](.gemini/antigravity/brain/b4d7abea-e48c-404a-9807-e3cab6b9e32e/publishing_guide.md.resolved) for full details.

### Required Documentation
GHL requires public URLs for:
- **Privacy Policy:** [your-domain.com/privacy](/privacy)
- **Terms of Service:** [your-domain.com/terms](/terms)
- **Support Email:** `support@yourdomain.com`

### Scopes Required
Ensure your app has the following scopes in the Developer Portal:
- `funnels/funnel.readonly`
- `funnels/page.readonly`
- `funnels/redirect.readonly`
- `funnels/redirect.write`
- `medias.readonly`
- `medias.write`
- `locations.readonly`

---

## 🏗 Project Structure

- `/app/api/auth`: OAuth initiation and callback handlers.
- `/app/api/llms`: Generation and upload endpoints.
- `/app/dashboard`: The main GHL integrated UI.
- `/app/privacy` & `/app/terms`: Legal documentation pages.
- `/lib/ghl`: GHL SDK wrappers and client logic.
- `/lib/supabase`: Supabase client and session management.
- `/public`: Assets including the official logo and app icon.

---

## 📄 License
This project is private and intended for use with the GoHighLevel Marketplace.
