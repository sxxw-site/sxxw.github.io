// src/assets/lang-switch.js
(function () {
  "use strict";

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

  // 默认语言是否走根目录（不带 /{lang}/ 前缀）
  const USE_ROOT_FOR_DEFAULT = true;
  const SELECT_ID = "langSelect";

  // ===== utils =====
  function canon(code) {
    return (code || "").trim().replace(/_/g, "-").toLowerCase();
  }

  function normalizeSlashes(path) {
    return (path || "").replace(/\/{2,}/g, "/");
  }

  function supportedSet() {
    return new Set(LANGS.map((x) => canon(x.code)).filter(Boolean));
  }

  // 你的“应用基路径”（不含语言段），这里用 <base href> 来推断
  // 对于你站点：应当是 "/pages/timetrails/"
  function inferAppBase() {
    const baseEl = document.querySelector("base[href]");
    if (baseEl) {
      const href = baseEl.getAttribute("href") || "/";
      const u = new URL(href, location.origin);
      let p = u.pathname;
      if (!p.endsWith("/")) p += "/";
      return normalizeSlashes(p);
    }
    // 没有 <base> 就退化为 "/"
    return "/";
  }

  // 从根路径第一段检测语言： /zh-hant/xxx
  function detectLangFromRoot(supported) {
    const parts = location.pathname.split("/").filter(Boolean);
    if (!parts.length) return null;
    const first = canon(parts[0]);
    return supported.has(first) ? first : null;
  }

  // 去掉根路径第一段语言（如果存在）
  // /zh-hant/pages/timetrails/feedback  -> /pages/timetrails/feedback
  function stripLangFromRoot(supported) {
    const hadTrailing = location.pathname.endsWith("/");
    const parts = location.pathname.split("/").filter(Boolean);

    if (parts.length && supported.has(canon(parts[0]))) {
      parts.shift();
    }

    const joined = parts.join("/");
    const out = joined ? ("/" + joined + (hadTrailing ? "/" : "")) : "/";
    return normalizeSlashes(out);
  }

  // 把“无语言的绝对路径”转换成“应用内部相对路径”
  // 例如：noLangAbs="/pages/timetrails/feedback"
  // appBase="/pages/timetrails/" => 返回 "/feedback"
  function toAppRelative(noLangAbs, appBase) {
    const base = appBase.endsWith("/") ? appBase : appBase + "/";
    let p = noLangAbs || "/";
    if (!p.startsWith("/")) p = "/" + p;

    if (base !== "/" && p.startsWith(base)) {
      p = "/" + p.slice(base.length);
    }
    return normalizeSlashes(p);
  }

  // 生成目标链接：
  // 默认语言:  /pages/timetrails/{rest}
  // 非默认:    /{lang}/pages/timetrails/{rest}
  function buildTarget(restRel, lang, appBase) {
    const rest = (restRel || "/").replace(/^\//, ""); // "feedback"
    const l = canon(lang);
    const def = canon(DEFAULT_LANG);

    const base = appBase.endsWith("/") ? appBase : appBase + "/";

    let out;
    if (USE_ROOT_FOR_DEFAULT && l === def) {
      out = base + rest;
    } else {
      out = "/" + l + base + rest;
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

    const langs = LANGS
      .map((x) => ({ code: canon(x.code), name: x.name || x.code }))
      .filter((x) => x.code);

    const supported = supportedSet();
    const appBase = inferAppBase(); // e.g. "/pages/timetrails/"

    // ✅ 语言段只看根第一段：/zh-hant/...
    const fromRoot = detectLangFromRoot(supported);
    const current = supported.has(fromRoot) ? fromRoot : canon(DEFAULT_LANG);

    setHtmlLang(current);
    renderSelect(sel, langs, current);

    sel.addEventListener("change", () => {
      const next = canon(sel.value) || canon(DEFAULT_LANG);

      // ✅ 先把当前 URL 去掉根语言段，得到 noLangAbs（绝对路径）
      const noLangAbs = stripLangFromRoot(supported);

      // ✅ 再把 noLangAbs 转成“应用内部相对路径” /feedback
      const restRel = toAppRelative(noLangAbs, appBase);

      // ✅ 最后按你的规则拼：/{lang}/pages/timetrails/feedback
      const target = buildTarget(restRel, next, appBase);

      location.href = target + location.search + location.hash;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
