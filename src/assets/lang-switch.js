// src/assets/lang-switch.js
(function () {
  "use strict";

  // ===== 你只需要维护“支持的语言列表” =====
  const DEFAULT_LANG = "zh-Hans";
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
  // ✅ 统一小写 + '_'->'-'，用于：URL/匹配/跳转
  function canon(code) {
    return (code || "").trim().replace(/_/g, "-").toLowerCase();
  }

  function normalizeSlashes(path) {
    return (path || "").replace(/\/{2,}/g, "/");
  }

  function supportedSet() {
    return new Set(LANGS.map((x) => canon(x.code)).filter(Boolean));
  }

  function detectLangFromPath(supported) {
    const parts = location.pathname.split("/").filter(Boolean);
    for (let i = 0; i < Math.min(parts.length, 10); i++) {
      const seg = canon(parts[i]);
      if (supported.has(seg)) return seg;
    }
    return null;
  }

  // ✅ 优先读 <base href>；否则只在路径里出现语言段时推断子路径；否则默认 "/"
  function inferBasePrefix(supported) {
    const baseEl = document.querySelector("base[href]");
    if (baseEl) {
      const href = baseEl.getAttribute("href") || "/";
      const u = new URL(href, location.origin);
      let p = u.pathname;
      if (!p.endsWith("/")) p += "/";
      return normalizeSlashes(p);
    }

    const parts = location.pathname.split("/").filter(Boolean);
    const langIdx = parts.findIndex((p) => supported.has(canon(p)));

    if (langIdx >= 0) {
      const prefix = "/" + parts.slice(0, langIdx).join("/") + "/";
      return normalizeSlashes(prefix);
    }
    return "/";
  }

  function stripLangFromPath(supported) {
    const hadTrailing = location.pathname.endsWith("/");
    const parts = location.pathname.split("/").filter(Boolean);

    const idx = parts.findIndex((p) => supported.has(canon(p)));
    if (idx >= 0) parts.splice(idx, 1);

    const joined = parts.join("/");
    const out = joined ? ("/" + joined + (hadTrailing ? "/" : "")) : "/";
    return normalizeSlashes(out);
  }

  function buildTarget(pathnameNoLang, lang, supported) {
    const base = inferBasePrefix(supported);
    const rest = (pathnameNoLang || "/").replace(/^\//, "");
    const l = canon(lang);
    const def = canon(DEFAULT_LANG);

    let out;
    if (USE_ROOT_FOR_DEFAULT && l === def) {
      out = base + rest;
    } else {
      out = base + l + (rest ? "/" + rest : "/");
    }
    return normalizeSlashes(out);
  }

  function setHtmlLang(lang) {
    // 注意：这里设成小写了；如果你希望 html lang 维持 BCP47 大小写（zh-Hans），
    // 可以在这里做映射表；但你当前诉求是 code 小写，我就按小写写。
    document.documentElement.setAttribute("lang", lang);
  }

  function renderSelect(sel, langs, current) {
    sel.innerHTML = "";
    for (const l of langs) {
      const opt = document.createElement("option");
      opt.value = l.code;         // ✅ value 用小写 code
      opt.textContent = l.name;   // 名称照旧
      if (l.code === current) opt.selected = true;
      sel.appendChild(opt);
    }
  }

  function init() {
    const sel = document.getElementById(SELECT_ID);
    if (!sel) return;

    const langs = LANGS.map((x) => ({ code: canon(x.code), name: x.name || x.code }))
      .filter((x) => x.code);

    const supported = supportedSet();

    // ✅ 只从 URL 推断；没有语言段 => 默认语言（小写）
    const fromPath = detectLangFromPath(supported);
    const current = supported.has(fromPath) ? fromPath : canon(DEFAULT_LANG);

    setHtmlLang(current);
    renderSelect(sel, langs, current);

    sel.addEventListener("change", () => {
      const next = canon(sel.value) || canon(DEFAULT_LANG);
      const noLang = stripLangFromPath(supported);
      const target = buildTarget(noLang, next, supported);
      location.href = target + location.search + location.hash;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
