/*
  AUTHFLOW SETUP:
  1. Create a project at https://supabase.com
  2. In Project Settings > API, copy the Project URL and publishable key below.
  3. In Authentication > URL Configuration, add your local and deployed URLs.
  4. Enable Google in Authentication > Providers and configure Google OAuth credentials.
  Never put a Supabase service_role key in browser code.
*/
(() => {
  "use strict";
  const SUPABASE_URL = "https://yglsmwgrebqrovbqsisc.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_x-9APjz4cvq_GuLOuFCmVw_uIHN5LlH";
  const configured = SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("YOUR_") && !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_");
  const client = configured && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

  const $ = id => document.getElementById(id);
  const page = document.body.dataset.page;
  const notice = (message, type = "info") => {
    const el = $("notice");
    if (!el) return;
    el.textContent = message;
    el.className = `notice ${type}`;
    el.hidden = false;
  };
  const requireClient = () => {
    if (!client) {
      notice("Supabase is not configured yet. Add your Project URL and anon/public key in js/app.js, then reload.", "error");
      return false;
    }
    return true;
  };
  // Basic format check: one @, a domain, and a dot after the @.
  // Supabase remains responsible for checking whether the account can authenticate.
  const isValidEmail = value => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(value.trim());
  const setBusy = (button, busy, label) => {
    if (!button) return;
    button.disabled = busy;
    if (busy) { button.dataset.originalText = button.textContent; button.textContent = label || "Please wait…"; }
    else if (button.dataset.originalText) button.textContent = button.dataset.originalText;
  };
  document.querySelectorAll("[data-toggle-password]").forEach(button => {
    button.addEventListener("click", () => {
      const input = $(button.dataset.togglePassword);
      if (!input) return;
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      button.textContent = reveal ? "Hide" : "Show";
      button.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
    });
  });

  async function goToDashboard() { window.location.replace("dashboard.html"); }
  async function getSession() {
    if (!requireClient()) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function initLogin() {
    if (!requireClient()) return;
    try { if (await getSession()) return goToDashboard(); } catch (e) { notice(e.message, "error"); }
    $("loginForm")?.addEventListener("submit", async event => {
      event.preventDefault();
      const button = $("loginButton"); setBusy(button, true);
      try {
        const email = $("email").value.trim();
        const password = $("password").value;
        if (!email || !password) throw new Error("Please enter your email and password.");
        if (!isValidEmail(email)) throw new Error("Enter a valid email address, such as name@example.com.");
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await goToDashboard();
      } catch (e) { notice(e.message || "Unable to sign in. Please try again.", "error"); }
      finally { setBusy(button, false); }
    });
    $("googleButton")?.addEventListener("click", async () => {
      try {
        const { error } = await client.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.origin + "/dashboard.html" }
        });
        if (error) throw error;
      } catch (e) { notice(e.message, "error"); }
    });
    $("forgotPassword")?.addEventListener("click", async () => {
      const email = $("email").value.trim();
      if (!email) return notice("Enter your email address first, then choose Forgot password.", "error");
      if (!isValidEmail(email)) return notice("Enter a valid email address, such as name@example.com.", "error");
      try {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password.html"
        });
        if (error) throw error;
        notice("If an account exists for that email, a password reset link will be sent. Check your inbox.", "success");
      } catch (e) { notice(e.message, "error"); }
    });
  }

  async function initSignup() {
    if (!requireClient()) return;
    $("signupForm")?.addEventListener("submit", async event => {
      event.preventDefault();
      const button = $("signupButton"); setBusy(button, true);
      try {
        const fullName = $("fullName").value.trim();
        const email = $("email").value.trim();
        const password = $("password").value;
        if (!fullName || !email || !password) throw new Error("Please complete all fields.");
        if (!isValidEmail(email)) throw new Error("Enter a valid email address, such as name@example.com.");
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        const { data, error } = await client.auth.signUp({
          email, password, options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + "/dashboard.html" }
        });
        if (error) throw error;
        if (data.session) await goToDashboard();
        else notice("Account created. Check your email for a confirmation link before signing in.", "success");
      } catch (e) { notice(e.message || "Unable to create account.", "error"); }
      finally { setBusy(button, false); }
    });
    $("googleButton")?.addEventListener("click", async () => {
      try {
        const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/dashboard.html" } });
        if (error) throw error;
      } catch (e) { notice(e.message, "error"); }
    });
  }

  async function initDashboard() {
    if (!requireClient()) return;
    try {
      const session = await getSession();
      if (!session) return window.location.replace("index.html");
      const user = session.user;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "there";
      $("userName").textContent = name;
      $("userEmail").textContent = user.email || "Not available";
      $("avatar").textContent = name.charAt(0).toUpperCase();
      $("authProvider").textContent = user.app_metadata?.provider === "google" ? "Google OAuth" : "Email & password";
      client.auth.onAuthStateChange((event, newSession) => {
        if (event === "SIGNED_OUT" || !newSession) window.location.replace("index.html");
      });
    } catch (e) { notice(e.message, "error"); }
    $("logoutButton")?.addEventListener("click", async () => {
      const button = $("logoutButton"); setBusy(button, true);
      try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        window.location.replace("index.html");
      } catch (e) { notice(e.message, "error"); setBusy(button, false); }
    });
  }

  async function initReset() {
    if (!requireClient()) return;
    // Supabase processes the recovery link from the URL and establishes a recovery session.
    client.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") notice("Recovery link verified. Choose your new password.", "success");
    });
    $("resetForm")?.addEventListener("submit", async event => {
      event.preventDefault();
      const button = event.submitter;
      setBusy(button, true);
      try {
        const password = $("password").value;
        if (password.length < 8) throw new Error("Use at least 8 characters.");
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        notice("Your password has been updated. You can now sign in.", "success");
        setTimeout(() => window.location.replace("index.html"), 1800);
      } catch (e) { notice(e.message || "Could not update password.", "error"); }
      finally { setBusy(button, false); }
    });
  }

  if (page === "login") initLogin();
  if (page === "signup") initSignup();
  if (page === "dashboard") initDashboard();
  if (page === "reset") initReset();
})();
