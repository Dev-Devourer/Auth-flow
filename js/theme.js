(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem("authflow-theme");
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  const updateButton = () => {
    const button = document.getElementById("themeToggle");
    if (button) button.textContent = root.dataset.theme === "light" ? "☀" : "☾";
  };
  document.addEventListener("DOMContentLoaded", () => {
    updateButton();

    // Accessible sidebar: supports the menu button, close button, backdrop, and Escape.
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("siteSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarClose = document.getElementById("sidebarClose");
    const setSidebarOpen = open => {
      if (!menuToggle || !sidebar || !sidebarOverlay) return;
      document.body.classList.toggle("sidebar-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      sidebar.setAttribute("aria-hidden", String(!open));
      sidebar.inert = !open;
      if (open) sidebarClose?.focus();
      else menuToggle.focus();
    };
    menuToggle?.addEventListener("click", () => {
      setSidebarOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    sidebarClose?.addEventListener("click", () => setSidebarOpen(false));
    sidebarOverlay?.addEventListener("click", () => setSidebarOpen(false));
    sidebar?.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        // Keep the drawer open for in-drawer About/Contact anchors.
        if (!link.getAttribute("href")?.startsWith("#")) setSidebarOpen(false);
      });
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && document.body.classList.contains("sidebar-open")) {
        setSidebarOpen(false);
      }
    });

    document.getElementById("themeToggle")?.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      localStorage.setItem("authflow-theme", root.dataset.theme);
      updateButton();
    });
    document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  });
})();
