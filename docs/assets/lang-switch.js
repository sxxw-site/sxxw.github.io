// src/assets/lang-switch.js
(function () {
  "use strict";

  // ===== 你只需要维护“支持的语言列表” =====
  const DEFAULT_LANG = "zh-hans";
  const LANGS = [
    { code: "en", name: "English" },
    { code: "en-GB", name: "English (UK)" },
    { code: "en-AU", name: "English (Australia)" },
    { code: "en-CA", name: "English (Canada)" },
    { code: "en-IN", name: "English (India)" },

    { code: "zh-Hans", name: "简体中文" },
    { code: "zh-Hant", name: "繁體中文" },
    { code: "zh-HK", name: "中文（香港）" },

    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },

    { code: "fr", name: "Français" },
    { code: "fr-CA", name: "Français (Canada)" },

    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },

    { code: "es", name: "Español (España)" },
    { code: "es-419", name: "Español (Latinoamérica)" },
    { code: "es-MX", name: "Español (México)" },

    { code: "pt-PT", name: "Português (Portugal)" },
    { code: "pt-BR", name: "Português (Brasil)" },

    { code: "ru", name: "Русский" },
    { code: "uk", name: "Українська" },

    { code: "ar", name: "العربية" },
    { code: "he", name: "עברית" },
    { code: "fa", name: "فارسی" },

    { code: "tr", name: "Türkçe" },
    { code: "hi", name: "हिन्दी" },
    { code: "bn", name: "বাংলা" },
    { code: "mr", name: "मराठी" },
    { code: "ta", name: "தமிழ்" },
    { code: "te", name: "తెలుగు" },
    { code: "kn", name: "ಕನ್ನಡ" },
    { code: "gu", name: "ગુજરાતી" },
    { code: "pa", name: "ਪੰਜਾਬੀ" },
    { code: "ml", name: "മലയാളം" },

    { code: "id", name: "Bahasa Indonesia" },
    { code: "ms", name: "Bahasa Melayu" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "th", name: "ไทย" },

    { code: "pl", name: "Polski" },
    { code: "cs", name: "Čeština" },
    { code: "sk", name: "Slovenčina" },
    { code: "hu", name: "Magyar" },
    { code: "ro", name: "Română" },
    { code: "bg", name: "Български" },
    { code: "el", name: "Ελληνικά" },

    { code: "fi", name: "Suomi" },
    { code: "sv", name: "Svenska" },
    { code: "da", name: "Dansk" },
    { code: "nb", name: "Norsk bokmål" },

    { code: "nl", name: "Nederlands" },
    { code: "nl-BE", name: "Nederlands (België)" },
    { code: "hr", name: "Hrvatski" },
    { code: "sl", name: "Slovenščina" },
    { code: "et", name: "Eesti" },
    { code: "lv", name: "Latviešu" },
    { code: "lt", name: "Lietuvių" },

    { code: "kk", name: "Қазақша" },
    { code: "be", name: "Беларуская" },
  ];

  // 默认语言是否走根目录：/index.html（true） vs /zh-hans/index.html（false）
  const USE_ROOT_FOR_DEFAULT = true;

  const SELECT_ID = "langSelect";

  // ===== utils =====
  function norm(code) {
    return (code || "").trim().replace(/_/g, "-").toLowerCase();
  }

  function normalizeSlashes(path) {
    return (path || "").replace(/\/{2,}/g, "/");
  }

  function supportedSet() {
    return new Set(LANGS.map((x) => norm(x.code)));
  }

  function detectLangFromPath(supported) {
    const parts = location.pathname.split("/").filter(Boolean);
    for (let i = 0; i < Math.min(parts.length, 6); i++) {
      const c = norm(parts[i]);
      if (supported.has(c)) return c;
    }
    return null;
  }

  // ✅ 更稳：优先读 <base href>；否则只在“路径里已出现语言段”时推断子路径；否则默认 "/"
  function inferBasePrefix(supported) {
    const baseEl = document.querySelector("base[href]");
    if (baseEl) {
      const href = baseEl.getAttribute("href") || "/";
      // 确保形如 "/repo/" 或 "/"
      const u = new URL(href, location.origin);
      let p = u.pathname;
      if (!p.endsWith("/")) p += "/";
      return normalizeSlashes(p);
    }

    const parts = location.pathname.split("/").filter(Boolean);
    const langIdx = parts.findIndex((p) => supported.has(norm(p)));

    // 只有当路径里确实出现语言段，才认为前面是子路径（/repo/<lang>/...）
    if (langIdx >= 0) {
      const prefix = "/" + parts.slice(0, langIdx).join("/") + "/";
      return normalizeSlashes(prefix);
    }

    // 否则就是普通站点根路径
    return "/";
  }

  // ✅ 修复：永远不会返回 //，空路径就是 "/"
  function stripLangFromPath(supported) {
    const hadTrailing = location.pathname.endsWith("/");
    const parts = location.pathname.split("/").filter(Boolean);

    const idx = parts.findIndex((p) => supported.has(norm(p)));
    if (idx >= 0) parts.splice(idx, 1);

    const joined = parts.join("/");
    let out = joined ? ("/" + joined + (hadTrailing ? "/" : "")) : "/";
    return normalizeSlashes(out);
  }

  function buildTarget(pathnameNoLang, lang, supported) {
    const base = inferBasePrefix(supported);
    const rest = (pathnameNoLang || "/").replace(/^\//, ""); // 去掉开头 /
    const l = norm(lang);

    let out;
    if (USE_ROOT_FOR_DEFAULT && l === norm(DEFAULT_LANG)) {
      // 默认语言走根目录
      out = base + rest;
    } else {
      out = base + l + (rest ? "/" + rest : "/");
    }

    return normalizeSlashes(out);
  }

  function setHtmlLang(lang) {
    document.documentElement.setAttribute("lang", lang);
  }

  function renderSelect(sel, langs, current) {
    sel.innerHTML = "";
    for (const l of langs) {
      const opt = document.createElement("option");
      opt.value = l.code;
      opt.textContent = l.name;
      if (l.code === current) opt.selected = true;
      sel.appendChild(opt);
    }
  }

  function init() {
    const sel = document.getElementById(SELECT_ID);
    if (!sel) return;

    const langs = LANGS.map((x) => ({ code: norm(x.code), name: x.name || x.code })).filter(
      (x) => x.code
    );

    const supported = supportedSet();

    // 1) 从 URL 推断当前语言
    const fromPath = detectLangFromPath(supported);

    // 2) 其次用本地记忆（用户上次选择）
    const fromStore = norm(localStorage.getItem("site_lang"));

    // 3) 兜底默认语言（无参数/无语言段 => 中文）
    const current = supported.has(fromPath)
      ? fromPath
      : supported.has(fromStore)
        ? fromStore
        : norm(DEFAULT_LANG);

    setHtmlLang(current);
    renderSelect(sel, langs, current);

    sel.addEventListener("change", () => {
      const next = norm(sel.value) || norm(DEFAULT_LANG);
      localStorage.setItem("site_lang", next);

      const noLang = stripLangFromPath(supported);
      const target = buildTarget(noLang, next, supported);

      location.href = target + location.search + location.hash;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
