// ═══════════════════════════════════════════════════════
//  Nova Dashboard — scripts_new.js
//  Fixes: sidebar toggle, quick link icons, full UI/UX
// ═══════════════════════════════════════════════════════

const App = {
  quickLinks: [],
  settings: {
    theme: "light",
    searchEngine: "google",
    userName: "",
    weatherLocation: "",
    bgBlur: "5",
    customBackground: null,
  },
  searchEngines: {
    google:     { name: "Google",     icon: "fab fa-google",    url: "https://google.com/search",    q: "q" },
    bing:       { name: "Bing",       icon: "fab fa-microsoft", url: "https://www.bing.com/search",  q: "q" },
    duckduckgo: { name: "DuckDuckGo", icon: "fas fa-shield-alt",url: "https://duckduckgo.com/",      q: "q" },
  },
  defaultLinks: [
    { name: "ChatGPT",  url: "https://chat.openai.com",      icon: "fas fa-robot",    color: "#10a37f" },
    { name: "GitHub",   url: "https://github.com",            icon: "fab fa-github",   color: "#6e40c9" },
    { name: "Gmail",    url: "https://mail.google.com",       icon: "fas fa-envelope", color: "#ea4335" },
    { name: "YouTube",  url: "https://youtube.com",           icon: "fab fa-youtube",  color: "#ff0000" },
    { name: "Gemini",   url: "https://gemini.google.com",     icon: "fas fa-gem",      color: "#8e24aa" },
  ],
  dragged: null,
  refs: {},
};

// ─── DOM Cache ────────────────────────────────────────────
function cacheRefs() {
  App.refs = {
    html:               document.documentElement,
    body:               document.body,
    appContainer:       document.getElementById("app-container"),
    sidebar:            document.getElementById("sidebar"),
    sidebarOverlay:     document.getElementById("sidebar-overlay"),
    sidebarToggle:      document.getElementById("sidebar-toggle"),
    closeSidebar:       document.getElementById("close-sidebar"),

    clock:              document.getElementById("clock"),
    date:               document.getElementById("date"),
    weatherEl:          document.getElementById("weather"),
    tempEl:             document.getElementById("temperature"),
    greeting:           document.getElementById("greeting"),
    motivation:         document.getElementById("motivation"),
    themeToggle:        document.getElementById("theme-toggle"),
    themeOptionsGrid:   document.getElementById("theme-options-grid"),

    searchEngineBtn:    document.getElementById("search-engine-btn"),
    searchEngineIcon:   document.getElementById("search-engine-icon"),
    searchEngineDropdown: document.getElementById("search-engine-dropdown"),
    searchForm:         document.getElementById("search-form"),
    searchInput:        document.getElementById("search-input"),
    searchBtn:          document.getElementById("search-btn"),
    sendBtn:            document.getElementById("send-btn"),
    chatContainer:      document.getElementById("chat-container"),

    quickLinksGrid:     document.getElementById("quick-links-grid"),
    sidebarLinksList:   document.getElementById("sidebar-links-list"),

    addLinkModal:       document.getElementById("add-link-modal"),
    addLinkForm:        document.getElementById("add-link-form"),
    closeLinkModal:     document.getElementById("close-link-modal"),
    cancelLinkBtn:      document.getElementById("cancel-link-btn"),
    modalTitle:         document.getElementById("modal-title"),
    saveLinkBtn:        document.getElementById("save-link-btn"),
    linkName:           document.getElementById("link-name"),
    linkUrl:            document.getElementById("link-url"),
    iconSelect:         document.getElementById("icon-select"),
    iconPreview:        document.getElementById("icon-preview"),
    linkColor:          document.getElementById("link-color"),

    settingsBtn:        document.getElementById("settings-btn"),
    settingsModal:      document.getElementById("settings-modal"),
    closeSettingsModal: document.getElementById("close-settings-modal"),
    customBgUpload:     document.getElementById("custom-bg-upload"),
    customBgBtn:        document.getElementById("custom-bg-btn"),
    resetBgBtn:         document.getElementById("reset-bg-btn"),
    blurAmount:         document.getElementById("blur-amount"),
    blurValue:          document.getElementById("blur-value"),
    userNameInput:      document.getElementById("user-name"),
    weatherLocationInput: document.getElementById("weather-location"),
    resetSettingsBtn:   document.getElementById("reset-settings-btn"),
    saveSettingsBtn:    document.getElementById("save-settings-btn"),
  };
}

// ─── Storage ──────────────────────────────────────────────
function loadData() {
  try {
    const links = localStorage.getItem("nova_links");
    App.quickLinks = links ? JSON.parse(links) : [...App.defaultLinks];
  } catch { App.quickLinks = [...App.defaultLinks]; }

  try {
    const saved = localStorage.getItem("nova_settings");
    if (saved) App.settings = { ...App.settings, ...JSON.parse(saved) };
  } catch {}
}

function save(key = "all") {
  try {
    if (key === "all" || key === "links")
      localStorage.setItem("nova_links", JSON.stringify(App.quickLinks));
    if (key === "all" || key === "settings")
      localStorage.setItem("nova_settings", JSON.stringify(App.settings));
  } catch (e) { console.warn("Save failed:", e); }
}

// ─── SIDEBAR FIX ─────────────────────────────────────────
function setupSidebar() {
  const { sidebar, sidebarOverlay, sidebarToggle, closeSidebar, appContainer } = App.refs;

  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("visible");
    appContainer.classList.add("sidebar-open");
    sidebarToggle.setAttribute("aria-expanded", "true");
  }

  function closeSidebarFn() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
    appContainer.classList.remove("sidebar-open");
    sidebarToggle.setAttribute("aria-expanded", "false");
  }

  // ← THIS was the core bug: the old code used .active but CSS used .open
  sidebarToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.contains("open") ? closeSidebarFn() : openSidebar();
  });

  closeSidebar?.addEventListener("click", closeSidebarFn);

  sidebarOverlay?.addEventListener("click", closeSidebarFn);

  // Close on outside click (desktop too now)
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !sidebarToggle.contains(e.target)
    ) closeSidebarFn();
  });

  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebarFn();
  });
}

// ─── THEME ────────────────────────────────────────────────
const THEME_CYCLE = ["light", "dark", "synthwave", "dracula", "bumblebee", "cyberpunk", "emerald"];

function applyTheme(name) {
  App.refs.html.setAttribute("data-theme", name);
  App.settings.theme = name;
  save("settings");

  // Update active swatch
  document.querySelectorAll(".theme-swatch").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === name);
  });
}

function setupTheme() {
  applyTheme(App.settings.theme || "light");

  // Swatch clicks
  document.querySelectorAll(".theme-swatch").forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
  });

  // Filter tabs
  document.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const cat = tab.dataset.category;
      document.querySelectorAll(".theme-swatch").forEach(s => {
        s.style.display = (cat === "all" || s.dataset.category === cat) ? "" : "none";
      });
    });
  });

  // Cycle button
  App.refs.themeToggle?.addEventListener("click", () => {
    const idx = THEME_CYCLE.indexOf(App.settings.theme);
    applyTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  });
}

// ─── CLOCK & DATE ─────────────────────────────────────────
function updateClock() {
  const now  = new Date();
  const hh   = now.getHours().toString().padStart(2, "0");
  const mm   = now.getMinutes().toString().padStart(2, "0");
  if (App.refs.clock) App.refs.clock.textContent = `${hh}:${mm}`;
  if (App.refs.date)  App.refs.date.textContent  = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  // Greeting
  const hour = now.getHours();
  let g = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  if (App.settings.userName) g += `, ${App.settings.userName}`;
  if (App.refs.greeting) App.refs.greeting.textContent = g;
}

// ─── WEATHER ──────────────────────────────────────────────
async function fetchWeather() {
  const apiKey = localStorage.getItem("weatherApiKey");
  if (!apiKey || !App.refs.tempEl) return;

  try {
    const loc = App.settings.weatherLocation || "auto:ip";
    const url = loc === "auto:ip"
      ? null
      : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(loc)}&units=metric&appid=${apiKey}`;

    if (!url && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${apiKey}`);
        renderWeather(await r.json());
      });
    } else if (url) {
      const r = await fetch(url);
      renderWeather(await r.json());
    }
  } catch {}
}

function renderWeather(data) {
  if (!data?.main) return;
  if (App.refs.tempEl) App.refs.tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  const wi = App.refs.weatherEl?.querySelector("i");
  if (!wi) return;
  const id = data.weather?.[0]?.id ?? 800;
  wi.className = id >= 200 && id < 300 ? "fas fa-bolt"
    : id >= 300 && id < 400 ? "fas fa-cloud-rain"
    : id >= 500 && id < 600 ? "fas fa-cloud-showers-heavy"
    : id >= 600 && id < 700 ? "fas fa-snowflake"
    : id >= 700 && id < 800 ? "fas fa-smog"
    : id === 800            ? "fas fa-sun"
    : "fas fa-cloud-sun";
}

// ─── SEARCH ───────────────────────────────────────────────
function setupSearch() {
  const { searchEngineBtn, searchEngineDropdown, searchForm, searchBtn, sendBtn, searchInput } = App.refs;

  updateEngineDisplay();

  // Toggle dropdown
  searchEngineBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    searchEngineDropdown.classList.toggle("open");
  });
  document.addEventListener("click", () => searchEngineDropdown?.classList.remove("open"));

  // Engine options
  document.querySelectorAll(".engine-option").forEach(opt => {
    opt.addEventListener("click", () => {
      App.settings.searchEngine = opt.dataset.engine;
      save("settings");
      updateEngineDisplay();
      searchEngineDropdown.classList.remove("open");
    });
  });

  // Search submit
  searchForm?.addEventListener("submit", (e) => { e.preventDefault(); performSearch(); });
  searchBtn?.addEventListener("click", (e) => { e.preventDefault(); performSearch(); });
  sendBtn?.addEventListener("click", (e) => { e.preventDefault(); handleAI(); });
}

function updateEngineDisplay() {
  const eng = App.searchEngines[App.settings.searchEngine];
  if (!eng || !App.refs.searchEngineIcon) return;
  App.refs.searchEngineIcon.className = eng.icon;
  document.querySelectorAll(".engine-option").forEach(o => {
    o.classList.toggle("active", o.dataset.engine === App.settings.searchEngine);
  });
}

function performSearch() {
  const q = App.refs.searchInput?.value.trim();
  if (!q) return;
  const eng = App.searchEngines[App.settings.searchEngine];
  window.open(`${eng.url}?${eng.q}=${encodeURIComponent(q)}`, "_blank");
}

async function handleAI() {
  const q = App.refs.searchInput?.value.trim();
  if (!q || !App.refs.chatContainer) return;
  App.refs.searchInput.value = "";

  // Remove welcome
  App.refs.chatContainer.querySelector(".chat-welcome")?.remove();

  appendMessage("user", escapeHtml(q));
  const aiEl = appendMessage("ai", `<div class="typing-dots"><span></span><span></span><span></span></div>`);

  try {
    // Replace with your actual AI call
    await new Promise(r => setTimeout(r, 800));
    aiEl.querySelector(".message-content").innerHTML = `<p>I'd need a Gemini API key to respond. You can configure it in Settings.</p>`;
  } catch (err) {
    aiEl.querySelector(".message-content").innerHTML = `<p class="error-text"><i class="fas fa-exclamation-triangle"></i> ${escapeHtml(err.message)}</p>`;
  }

  App.refs.chatContainer.scrollTop = App.refs.chatContainer.scrollHeight;
}

function appendMessage(role, html) {
  const div = document.createElement("div");
  div.className = `chat-msg ${role}-msg`;
  const icon = role === "user" ? "fas fa-user" : "fas fa-robot";
  div.innerHTML = `
    <div class="msg-avatar"><i class="${icon}"></i></div>
    <div class="message-content">${html}</div>
  `;
  App.refs.chatContainer.appendChild(div);
  App.refs.chatContainer.scrollTop = App.refs.chatContainer.scrollHeight;
  return div;
}

// ─── QUICK LINKS — FIXED ICON RENDERING ──────────────────
function renderQuickLinks() {
  const grid = App.refs.quickLinksGrid;
  const list = App.refs.sidebarLinksList;
  if (!grid) return;

  grid.innerHTML = "";
  if (list) list.innerHTML = "";

  App.quickLinks.forEach((link, idx) => {
    // ── GRID CARD ──
    const card = document.createElement("a");
    card.className = "ql-card";
    card.href = link.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.draggable = true;
    card.dataset.idx = idx;

    // Icon with custom color
    const iconColor = link.color || "var(--accent)";
    card.innerHTML = `
      <div class="ql-card-icon" style="color:${iconColor};background:${iconColor}1a">
        <i class="${link.icon || 'fas fa-link'}"></i>
      </div>
      <span class="ql-card-name">${escapeHtml(link.name)}</span>
      <div class="ql-card-actions">
        <button class="ql-action edit-btn" data-idx="${idx}" title="Edit" aria-label="Edit">
          <i class="fas fa-pen"></i>
        </button>
        <button class="ql-action del-btn" data-idx="${idx}" title="Delete" aria-label="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Prevent link navigation when clicking actions
    card.querySelectorAll(".ql-action").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const i = +btn.dataset.idx;
        if (btn.classList.contains("del-btn")) deleteLink(i);
        else openModal(App.quickLinks[i], i);
      });
    });

    // Drag events
    card.addEventListener("dragstart", (e) => {
      App.dragged = idx;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("dragover", (e) => { e.preventDefault(); card.classList.add("drag-over"); });
    card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drag-over");
      if (App.dragged !== null && App.dragged !== idx) {
        const arr = [...App.quickLinks];
        const [moved] = arr.splice(App.dragged, 1);
        arr.splice(idx, 0, moved);
        App.quickLinks = arr;
        save("links");
        renderQuickLinks();
      }
    });

    grid.appendChild(card);

    // ── SIDEBAR ITEM ──
    if (list) {
      const item = document.createElement("a");
      item.className = "sidebar-link-item";
      item.href = link.url;
      item.target = "_blank";
      item.rel = "noopener noreferrer";
      item.innerHTML = `
        <span class="sli-icon" style="color:${iconColor}">
          <i class="${link.icon || 'fas fa-link'}"></i>
        </span>
        <span class="sli-name">${escapeHtml(link.name)}</span>
        <i class="fas fa-external-link-alt sli-ext"></i>
      `;
      list.appendChild(item);
    }
  });
}

function deleteLink(idx) {
  if (!confirm(`Remove "${App.quickLinks[idx].name}"?`)) return;
  App.quickLinks.splice(idx, 1);
  save("links");
  renderQuickLinks();
}

// ─── MODAL ────────────────────────────────────────────────
function openModal(link = null, editIdx = null) {
  const { addLinkModal, addLinkForm, modalTitle, saveLinkBtn, linkName, linkUrl, iconSelect, iconPreview, linkColor } = App.refs;

  addLinkForm.reset();
  delete addLinkForm.dataset.editIdx;

  if (link !== null && editIdx !== null) {
    modalTitle.textContent = "Edit Link";
    saveLinkBtn.textContent = "Save Changes";
    linkName.value = link.name;
    linkUrl.value  = link.url;
    const opt = [...iconSelect.options].find(o => o.value === link.icon);
    if (opt) opt.selected = true;
    if (link.color) linkColor.value = link.color;
    iconPreview.innerHTML = `<i class="${link.icon || 'fas fa-link'}"></i>`;
    iconPreview.style.color = link.color || "";
    addLinkForm.dataset.editIdx = editIdx;
  } else {
    modalTitle.textContent = "Add Quick Link";
    saveLinkBtn.textContent = "Add Link";
    iconPreview.innerHTML = `<i class="fas fa-link"></i>`;
  }

  addLinkModal.classList.add("open");
  addLinkModal.setAttribute("aria-hidden", "false");
  linkName.focus();
}

function closeModal() {
  App.refs.addLinkModal.classList.remove("open");
  App.refs.addLinkModal.setAttribute("aria-hidden", "true");
}

function saveLink(e) {
  e.preventDefault();
  const { linkName, linkUrl, iconSelect, linkColor, addLinkForm } = App.refs;
  let name = linkName.value.trim();
  let url  = linkUrl.value.trim();
  if (!name || !url) return;
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;

  const data = { name, url, icon: iconSelect.value, color: linkColor.value };
  const editIdx = addLinkForm.dataset.editIdx;

  if (editIdx !== undefined) {
    App.quickLinks[+editIdx] = data;
  } else {
    App.quickLinks.push(data);
  }
  save("links");
  renderQuickLinks();
  closeModal();
}

function setupQuickLinks() {
  renderQuickLinks();

  // Open modal buttons
  document.getElementById("add-quick-link-main")?.addEventListener("click", () => openModal());
  document.getElementById("add-quick-link-sidebar")?.addEventListener("click", () => openModal());

  // Modal close
  App.refs.closeLinkModal?.addEventListener("click", closeModal);
  App.refs.cancelLinkBtn?.addEventListener("click", closeModal);
  App.refs.addLinkModal?.addEventListener("click", (e) => {
    if (e.target === App.refs.addLinkModal) closeModal();
  });

  // Form submit
  App.refs.addLinkForm?.addEventListener("submit", saveLink);

  // Icon preview live update
  App.refs.iconSelect?.addEventListener("change", () => {
    App.refs.iconPreview.innerHTML = `<i class="${App.refs.iconSelect.value}"></i>`;
    App.refs.iconPreview.style.color = App.refs.linkColor.value;
  });
  App.refs.linkColor?.addEventListener("input", () => {
    App.refs.iconPreview.style.color = App.refs.linkColor.value;
  });
}

// ─── SETTINGS ─────────────────────────────────────────────
function setupSettings() {
  const { settingsBtn, settingsModal, closeSettingsModal, customBgBtn, customBgUpload, resetBgBtn, blurAmount, blurValue, userNameInput, weatherLocationInput, resetSettingsBtn, saveSettingsBtn } = App.refs;

  // Pre-fill
  if (userNameInput)       userNameInput.value       = App.settings.userName || "";
  if (weatherLocationInput) weatherLocationInput.value = App.settings.weatherLocation || "";
  if (blurAmount) {
    blurAmount.value = App.settings.bgBlur || "5";
    if (blurValue) blurValue.textContent = `${blurAmount.value}px`;
  }

  settingsBtn?.addEventListener("click",        () => { settingsModal.classList.add("open"); settingsModal.setAttribute("aria-hidden","false"); });
  closeSettingsModal?.addEventListener("click", () => { settingsModal.classList.remove("open"); settingsModal.setAttribute("aria-hidden","true"); });
  settingsModal?.addEventListener("click",      (e) => { if (e.target === settingsModal) settingsModal.classList.remove("open"); });

  blurAmount?.addEventListener("input", () => {
    if (blurValue) blurValue.textContent = `${blurAmount.value}px`;
  });

  customBgBtn?.addEventListener("click", () => customBgUpload.click());
  customBgUpload?.addEventListener("change", () => {
    const file = customBgUpload.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      App.settings.customBackground = ev.target.result;
      applyBackground();
    };
    reader.readAsDataURL(file);
  });

  resetBgBtn?.addEventListener("click", () => {
    App.settings.customBackground = null;
    applyBackground();
  });

  saveSettingsBtn?.addEventListener("click", () => {
    App.settings.userName        = userNameInput?.value.trim() || "";
    App.settings.weatherLocation = weatherLocationInput?.value.trim() || "";
    App.settings.bgBlur          = blurAmount?.value || "5";
    save("settings");
    updateClock();
    applyBackground();
    settingsModal.classList.remove("open");
  });

  resetSettingsBtn?.addEventListener("click", () => {
    if (!confirm("Reset all settings to defaults?")) return;
    localStorage.removeItem("nova_links");
    localStorage.removeItem("nova_settings");
    location.reload();
  });
}

function applyBackground() {
  const { body } = App.refs;
  const bg = App.settings.customBackground;
  if (bg) {
    body.style.setProperty("--bg-image", `url(${bg})`);
    body.classList.add("custom-bg");
  } else {
    body.style.removeProperty("--bg-image");
    body.classList.remove("custom-bg");
  }
}

// ─── UTILS ───────────────────────────────────────────────
function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  cacheRefs();
  loadData();
  setupSidebar();
  setupTheme();
  setupSearch();
  setupQuickLinks();
  setupSettings();
  applyBackground();
  updateClock();
  fetchWeather();
  setInterval(updateClock, 1000);
});