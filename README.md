# AuthFlow

A responsive authentication demo built with HTML, CSS, vanilla JavaScript, and Supabase Auth.

## Features
- Email/password sign in and account creation
- Show/hide password controls
- Google OAuth button
- Password reset email and reset page
- Protected dashboard used as the authenticated homepage after sign-in/sign-up\n- Basic email format validation (requires an @ and a dot in the domain)
- Sign out and persistent Supabase sessions
- Interactive logic gate simulator and truth tables (AND, OR, NOT, NAND, NOR, XOR, XNOR)\n- Binary, octal, decimal and hexadecimal converter\n- Light/dark theme toggle
- Responsive layout

## 1. Configure Supabase
1. Create a project at [Supabase](https://supabase.com/).
2. Open **Project Settings → API** and copy the Project URL and the **publishable key** (it starts with `sb_publishable_`).
3. Open `js/app.js` and replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_ANON_PUBLIC_KEY`
4. Do not use the `service_role` key in frontend code. The publishable key is designed for browser use. Never put a secret key or legacy `service_role` key in frontend code. If you later add database tables, enable Row Level Security (RLS) and write least-privilege policies before exposing data.

## 2. Configure Auth URLs
In Supabase, open **Authentication → URL Configuration**. The app redirects authenticated users to `dashboard.html`; this is the post-login/post-signup homepage in this starter.
- Set the Site URL to your deployed site URL.
- Add Redirect URLs for local development and deployment, for example:
  - `http://localhost:5500/**`
  - `https://YOUR-PROJECT.vercel.app/**`

For Google login, open **Authentication → Providers → Google**, enable it, and add the Google OAuth Client ID and Client Secret from Google Cloud Console. Also add the Supabase callback URL shown in the provider settings to your Google OAuth authorized redirect URIs.

## 3. Run locally
Use VS Code Live Server or another local static server. Do not rely on opening the HTML file directly because OAuth redirects need an HTTP origin.
- Open this folder in VS Code.
- Start Live Server on `index.html` (commonly `http://localhost:5500`).

## 4. Deploy to GitHub + Vercel
1. Create a GitHub repository and push this folder.
2. In Vercel, choose **Add New → Project**, import the repository, and deploy it as a static site (no build command required; output directory can be `.`).
3. Add the deployed domain to Supabase Auth URL Configuration and set it as the Site URL.
4. Update Google OAuth authorized origins/redirect URI if needed.

## Important notes
- Email confirmation may be enabled in Supabase. In that case, users must click the confirmation email before they can sign in.
- Google OAuth will not work until the Google provider and credentials are configured in Supabase.
- This is a frontend demo. If you later add private database records, enable Row Level Security (RLS) and write policies that restrict each user's records to their own `auth.uid()`.
- Never commit passwords, service-role keys, OAuth client secrets, or other private credentials to GitHub.

## Logic Lab page
Open `logic.html` from the sidebar. It works locally without Supabase because the logic simulator and number converter run entirely in the browser.
