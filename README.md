# GHL llms.txt Plugin

Automatically generate and host a standards-compliant `llms.txt` file (following [llmstxt.org](https://llmstxt.org)) for your GoHighLevel sub-accounts.

## 🚀 Features

- **OAuth 2.0 Integration:** Secure connection to GHL sub-accounts using the official `@gohighlevel/api-client`.
- **Automated Discovery:** Scans all funnels and pages within a location.
- **llms.txt Generation:** Formats discovered pages into a structured markdown file optimized for LLMs.
- **Automatic Hosting:** Uploads the generated file directly to the GHL Media Library.
- **301 Redirects:** Automatically maps `yourdomain.com/llms.txt` to the hosted file URL.
- **SSO Dashboard:** Deeply integrated into the GHL UI as a Custom Page.

---

## 🛠 Setup & Installation

### 1. Prerequisites
- A GoHighLevel Developer Account.
- An app created in the [GHL Marketplace](https://marketplace.gohighlevel.com/).

### 2. Environment Variables
Create a `.env.local` file in the root directory (use `.env.local.example` as a template):

```env
GHL_CLIENT_ID="your_client_id"
GHL_CLIENT_SECRET="your_client_secret"
GHL_SHARED_SECRET_KEY="your_shared_secret_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GHL_REDIRECT_URI="http://localhost:3000/api/auth/callback"
```

### 3. Install Dependencies
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
5. **Verify:** Check your GHL Media Library for the new `llms.txt` file.

### GHL Iframe Testing (SSO)
To test the SSO logic inside the GHL UI:
1. Go to your **GHL Marketplace App Settings**.
2. Set the **Custom Page URL** to `http://localhost:3000/dashboard`.
3. Open a GHL Sub-account → **Settings** → **Custom Pages**.
4. Launch your app. The dashboard should automatically detect your `locationId` via SSO.

---

## 📦 Publishing to Marketplace

### 1. Production Deployment
Deploy your app to a provider like Vercel or Railway.
- Ensure all environment variables are set in your production dashboard.
- Update `GHL_REDIRECT_URI` and `NEXT_PUBLIC_APP_URL` to your production domain.

### 2. Update Marketplace App Settings
In the [GHL Marketplace Console](https://marketplace.gohighlevel.com/):
- **Redirect URI:** Update to `https://your-domain.com/api/auth/callback`.
- **Scopes:** Ensure `funnels.readonly`, `funnels.write`, `medias.readonly`, `medias.write`, and `locations.readonly` are checked.
- **Custom Page:** Set to `https://your-domain.com/dashboard`.

### 3. Submission
- Provide a clear description and screenshots of the dashboard.
- Submit for review via the GHL Marketplace dashboard.

---

## 🏗 Project Structure

- `/app/api/auth`: OAuth initiation and callback handlers.
- `/app/api/llms/generate`: Core pipeline (Discovery -> Generation -> Upload -> Redirect).
- `/app/dashboard`: The main GHL integrated UI.
- `/lib/ghl`: GHL SDK wrappers and business logic services.
- `/lib/sso.ts`: SSO decryption utility.
