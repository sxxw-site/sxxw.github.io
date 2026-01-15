// src/assets/lang-switch.js
(function () {
  "use strict";

  // ===== 你只需要维护“支持的语言列表” =====
  const DEFAULT_LANG = "zh-Hans";
  const LANGS = [
                    {
                        "code": "af",
                        "name": "南非荷兰语",
                        "asc_code": "af",
                        "displayName": "Afrikaans"
                    },
                    {
                        "code": "am",
                        "name": "阿姆哈拉语",
                        "asc_code": "am",
                        "displayName": "አማርኛ"
                    },
                    {
                        "code": "ar",
                        "name": "阿拉伯语",
                        "asc_code": "ar-SA",
                        "displayName": "العربية"
                    },
                    {
                        "code": "be",
                        "name": "白俄罗斯语",
                        "displayName": "Беларуская",
                        "asc_code": "be"
                    },
                    {
                        "code": "bg",
                        "name": "保加利亚语",
                        "displayName": "Български",
                        "asc_code": "bg"
                    },
                    {
                        "code": "bn",
                        "name": "孟加拉语",
                        "displayName": "বাংলা",
                        "asc_code": "bn"
                    },
                    {
                        "code": "bo",
                        "name": "藏语",
                        "asc_code": "bo",
                        "displayName": "བོད་སྐད་"
                    },
                    {
                        "code": "bs",
                        "name": "波斯尼亚语",
                        "asc_code": "bs",
                        "displayName": "Bosanski"
                    },
                    {
                        "code": "ca",
                        "name": "加泰罗尼亚语",
                        "asc_code": "ca",
                        "displayName": "Català"
                    },
                    {
                        "code": "cs",
                        "name": "捷克语",
                        "asc_code": "cs",
                        "displayName": "Čeština"
                    },
                    {
                        "code": "cy",
                        "name": "威尔士语",
                        "asc_code": "cy",
                        "displayName": "Cymraeg"
                    },
                    {
                        "code": "da",
                        "name": "丹麦语",
                        "asc_code": "da",
                        "displayName": "Dansk"
                    },
                    {
                        "code": "de",
                        "name": "德语",
                        "asc_code": "de-DE",
                        "displayName": "Deutsch"
                    },
                    {
                        "code": "el",
                        "name": "希腊语",
                        "asc_code": "el",
                        "displayName": "Ελληνικά"
                    },
                    {
                        "code": "en",
                        "name": "英语",
                        "asc_code": "en-US",
                        "displayName": "English"
                    },
                    {
                        "code": "en-AU",
                        "name": "英语（澳大利亚）",
                        "asc_code": "en-AU",
                        "displayName": "English (Australia)"
                    },
                    {
                        "code": "en-CA",
                        "name": "英语（加拿大）",
                        "asc_code": "en-CA",
                        "displayName": "English (Canada)"
                    },
                    {
                        "code": "en-GB",
                        "name": "英语（英国）",
                        "asc_code": "en-GB",
                        "displayName": "English (UK)"
                    },
                    {
                        "code": "en-IN",
                        "name": "英语（印度）",
                        "displayName": "English (India)",
                        "asc_code": "en-IN"
                    },
                    {
                        "code": "eo",
                        "name": "世界语",
                        "asc_code": "eo",
                        "displayName": "Esperanto"
                    },
                    {
                        "code": "es",
                        "name": "西班牙语（西班牙）",
                        "asc_code": "es-ES",
                        "displayName": "Español (España)"
                    },
                    {
                        "code": "es-419",
                        "name": "西班牙语（拉丁美洲）",
                        "displayName": "Español (Latinoamérica)",
                        "asc_code": "es-419"
                    },
                    {
                        "code": "es-MX",
                        "name": "西班牙语（墨西哥）",
                        "asc_code": "es-MX",
                        "displayName": "Español (México)"
                    },
                    {
                        "code": "et",
                        "name": "爱沙尼亚语",
                        "displayName": "Eesti",
                        "asc_code": "et"
                    },
                    {
                        "code": "eu",
                        "name": "巴斯克语",
                        "asc_code": "eu",
                        "displayName": "Euskara"
                    },
                    {
                        "code": "fa",
                        "name": "波斯语",
                        "displayName": "فارسی",
                        "asc_code": "fa"
                    },
                    {
                        "code": "fi",
                        "name": "芬兰语",
                        "asc_code": "fi",
                        "displayName": "Suomi"
                    },
                    {
                        "code": "fil",
                        "name": "菲律宾语",
                        "asc_code": "fil",
                        "displayName": "Filipino"
                    },
                    {
                        "code": "fr",
                        "name": "法语",
                        "asc_code": "fr-FR",
                        "displayName": "Français"
                    },
                    {
                        "code": "fr-CA",
                        "name": "法语（加拿大）",
                        "asc_code": "fr-CA",
                        "displayName": "Français (Canada)"
                    },
                    {
                        "code": "ga",
                        "name": "爱尔兰语",
                        "asc_code": "ga",
                        "displayName": "Gaeilge"
                    },
                    {
                        "code": "gl",
                        "name": "加利西亚语",
                        "asc_code": "gl",
                        "displayName": "Galego"
                    },
                    {
                        "code": "gu",
                        "name": "古吉拉特语",
                        "displayName": "ગુજરાતી",
                        "asc_code": "gu"
                    },
                    {
                        "code": "he",
                        "name": "希伯来语",
                        "asc_code": "he",
                        "displayName": "עברית"
                    },
                    {
                        "code": "hi",
                        "name": "印地语",
                        "asc_code": "hi",
                        "displayName": "हिन्दी"
                    },
                    {
                        "code": "hr",
                        "name": "克罗地亚语",
                        "asc_code": "hr",
                        "displayName": "Hrvatski"
                    },
                    {
                        "code": "hu",
                        "name": "匈牙利语",
                        "asc_code": "hu",
                        "displayName": "Magyar"
                    },
                    {
                        "code": "hy",
                        "name": "亚美尼亚语",
                        "asc_code": "hy",
                        "displayName": "Հայերեն"
                    },
                    {
                        "code": "id",
                        "name": "印度尼西亚语",
                        "asc_code": "id",
                        "displayName": "Bahasa Indonesia"
                    },
                    {
                        "code": "is",
                        "name": "冰岛语",
                        "asc_code": "is",
                        "displayName": "Íslenska"
                    },
                    {
                        "code": "it",
                        "name": "意大利语",
                        "asc_code": "it",
                        "displayName": "Italiano"
                    },
                    {
                        "code": "ja",
                        "name": "日语",
                        "asc_code": "ja",
                        "displayName": "日本語"
                    },
                    {
                        "code": "ka",
                        "name": "格鲁吉亚语",
                        "asc_code": "ka",
                        "displayName": "ქართული"
                    },
                    {
                        "code": "kk",
                        "name": "哈萨克语",
                        "displayName": "Қазақ тілі",
                        "asc_code": "kk"
                    },
                    {
                        "code": "km",
                        "name": "高棉语",
                        "asc_code": "km",
                        "displayName": "ខ្មែរ"
                    },
                    {
                        "code": "kn",
                        "name": "卡纳达语",
                        "displayName": "ಕನ್ನಡ",
                        "asc_code": "kn"
                    },
                    {
                        "code": "ko",
                        "name": "韩语",
                        "asc_code": "ko",
                        "displayName": "한국어"
                    },
                    {
                        "code": "lo",
                        "name": "老挝语",
                        "asc_code": "lo",
                        "displayName": "ລາວ"
                    },
                    {
                        "code": "lt",
                        "name": "立陶宛语",
                        "displayName": "Lietuvių",
                        "asc_code": "lt"
                    },
                    {
                        "code": "lv",
                        "name": "拉脱维亚语",
                        "displayName": "Latviešu",
                        "asc_code": "lv"
                    },
                    {
                        "code": "mk",
                        "name": "马其顿语",
                        "asc_code": "mk",
                        "displayName": "Македонски"
                    },
                    {
                        "code": "ml",
                        "name": "马拉雅拉姆语",
                        "displayName": "മലയാളം",
                        "asc_code": "ml"
                    },
                    {
                        "code": "mr",
                        "name": "马拉地语",
                        "displayName": "मराठी",
                        "asc_code": "mr"
                    },
                    {
                        "code": "ms",
                        "name": "马来语",
                        "asc_code": "ms",
                        "displayName": "Bahasa Melayu"
                    },
                    {
                        "code": "mt",
                        "name": "马耳他语",
                        "asc_code": "mt",
                        "displayName": "Malti"
                    },
                    {
                        "code": "my",
                        "name": "缅甸语",
                        "asc_code": "my",
                        "displayName": "မြန်မာ"
                    },
                    {
                        "code": "nb",
                        "name": "挪威语（书面挪威语）",
                        "asc_code": "no",
                        "displayName": "Norsk Bokmål"
                    },
                    {
                        "code": "ne",
                        "name": "尼泊尔语",
                        "asc_code": "ne",
                        "displayName": "नेपाली"
                    },
                    {
                        "code": "nl",
                        "name": "荷兰语",
                        "asc_code": "nl-NL",
                        "displayName": "Nederlands"
                    },
                    {
                        "code": "nl-BE",
                        "name": "荷兰语（比利时）",
                        "displayName": "Nederlands (België)",
                        "asc_code": "nl-BE"
                    },
                    {
                        "code": "nn",
                        "name": "挪威语（新挪威语）",
                        "asc_code": "nn",
                        "displayName": "Norsk nynorsk"
                    },
                    {
                        "code": "pa",
                        "name": "旁遮普语",
                        "displayName": "ਪੰਜਾਬੀ",
                        "asc_code": "pa"
                    },
                    {
                        "code": "pl",
                        "name": "波兰语",
                        "asc_code": "pl",
                        "displayName": "Polski"
                    },
                    {
                        "code": "ps",
                        "name": "普什图语",
                        "asc_code": "ps",
                        "displayName": "پښتو"
                    },
                    {
                        "code": "pt-BR",
                        "name": "葡萄牙语（巴西）",
                        "asc_code": "pt-BR",
                        "displayName": "Português (Brasil)"
                    },
                    {
                        "code": "pt-PT",
                        "name": "葡萄牙语（葡萄牙）",
                        "asc_code": "pt-PT",
                        "displayName": "Português (Portugal)"
                    },
                    {
                        "code": "ro",
                        "name": "罗马尼亚语",
                        "asc_code": "ro",
                        "displayName": "Română"
                    },
                    {
                        "code": "ru",
                        "name": "俄语",
                        "asc_code": "ru",
                        "displayName": "Русский"
                    },
                    {
                        "code": "si",
                        "name": "僧伽罗语",
                        "asc_code": "si",
                        "displayName": "සිංහල"
                    },
                    {
                        "code": "sk",
                        "name": "斯洛伐克语",
                        "asc_code": "sk",
                        "displayName": "Slovenčina"
                    },
                    {
                        "code": "sl",
                        "name": "斯洛文尼亚语",
                        "displayName": "Slovenščina",
                        "asc_code": "sl"
                    },
                    {
                        "code": "sq",
                        "name": "阿尔巴尼亚语",
                        "asc_code": "sq",
                        "displayName": "Shqip"
                    },
                    {
                        "code": "sr",
                        "name": "塞尔维亚语",
                        "asc_code": "sr",
                        "displayName": "Српски"
                    },
                    {
                        "code": "sr-Latn",
                        "name": "塞尔维亚语（拉丁字母）",
                        "asc_code": "sr-Latn",
                        "displayName": "Srpski"
                    },
                    {
                        "code": "sv",
                        "name": "瑞典语",
                        "asc_code": "sv",
                        "displayName": "Svenska"
                    },
                    {
                        "code": "sw",
                        "name": "斯瓦希里语",
                        "asc_code": "sw",
                        "displayName": "Kiswahili"
                    },
                    {
                        "code": "ta",
                        "name": "泰米尔语",
                        "displayName": "தமிழ்",
                        "asc_code": "ta"
                    },
                    {
                        "code": "te",
                        "name": "泰卢固语",
                        "displayName": "తెలుగు",
                        "asc_code": "te"
                    },
                    {
                        "code": "tg",
                        "name": "塔吉克语",
                        "asc_code": "tg",
                        "displayName": "Тоҷикӣ"
                    },
                    {
                        "code": "th",
                        "name": "泰语",
                        "asc_code": "th",
                        "displayName": "ไทย"
                    },
                    {
                        "code": "tr",
                        "name": "土耳其语",
                        "asc_code": "tr",
                        "displayName": "Türkçe"
                    },
                    {
                        "code": "uk",
                        "name": "乌克兰语",
                        "asc_code": "uk",
                        "displayName": "Українська"
                    },
                    {
                        "code": "ur",
                        "name": "乌尔都语",
                        "asc_code": "ur",
                        "displayName": "اردو"
                    },
                    {
                        "code": "ur-IN",
                        "name": "乌尔都语（印度）",
                        "asc_code": "ur-IN",
                        "displayName": "اردو (بھارت)"
                    },
                    {
                        "code": "uz",
                        "name": "乌兹别克语",
                        "asc_code": "uz",
                        "displayName": "O‘zbek"
                    },
                    {
                        "code": "vi",
                        "name": "越南语",
                        "asc_code": "vi",
                        "displayName": "Tiếng Việt"
                    },
                    {
                        "code": "yue",
                        "name": "粤语",
                        "asc_code": "yue",
                        "displayName": "粵語"
                    },
                    {
                        "code": "zh-HK",
                        "name": "中文（香港）",
                        "asc_code": "zh-Hant",
                        "displayName": "中文（香港）"
                    },
                    {
                        "code": "zh-Hans",
                        "name": "中文（简体）",
                        "asc_code": "zh-Hans",
                        "displayName": "中文（简体）"
                    },
                    {
                        "code": "zh-Hant",
                        "name": "中文（繁體）",
                        "asc_code": "zh-Hant",
                        "displayName": "中文（繁體）"
                    }
                ];

  // 默认语言是否走不带 /{lang}/ 的路径
  const USE_ROOT_FOR_DEFAULT = true;
  const SELECT_ID = "langSelect";

  // ===== utils =====
  function canon(code) {
    return (code || "").trim().replace(/_/g, "-").toLowerCase();
  }

  // 尽量输出更“BCP47 友好”的 lang（用于 <html lang="">）
  // 优先 asc_code（常带地区/规范大小写），否则回退到原始 code
  function htmlLangFor(codeLower, metaMap) {
    const meta = metaMap.get(codeLower);
    const raw = (meta && (meta.asc_code || meta.raw_code)) || codeLower;

    // 把 zh-hans / sr-latn 这种常见脚本码做个简单规范化：
    // 语言小写；脚本 TitleCase；地区大写（如果存在）
    const parts = String(raw).replace(/_/g, "-").split("-");
    if (!parts.length) return codeLower;

    const lang = (parts[0] || "").toLowerCase();
    const rest = parts.slice(1).map((p) => {
      if (p.length === 4) return p[0].toUpperCase() + p.slice(1).toLowerCase(); // Script
      if (p.length === 2 || p.length === 3) return p.toUpperCase(); // Region
      return p; // 其他保持原样
    });

    return [lang, ...rest].join("-");
  }

  function normalizeSlashes(path) {
    return (path || "").replace(/\/{2,}/g, "/");
  }

  function supportedSet() {
    return new Set(LANGS.map((x) => canon(x.code)).filter(Boolean));
  }

  // 你的应用真实基路径：来自 <base href="/pages/timetrails/">
  function inferAppBase() {
    const baseEl = document.querySelector("base[href]");
    if (baseEl) {
      const href = baseEl.getAttribute("href") || "/";
      const u = new URL(href, location.origin);
      let p = u.pathname;
      if (!p.endsWith("/")) p += "/";
      return normalizeSlashes(p);
    }
    return "/"; // 没有 base 就退化
  }

  // 语言段只允许在根第一段：/en/xxx
  function detectLangFromRoot(supported) {
    const parts = location.pathname.split("/").filter(Boolean);
    if (!parts.length) return null;
    const first = canon(parts[0]);
    return supported.has(first) ? first : null;
  }

  // 去掉根第一段语言（如果存在）
  function stripLangFromRoot(supported) {
    const hadTrailing = location.pathname.endsWith("/");
    const parts = location.pathname.split("/").filter(Boolean);

    if (parts.length && supported.has(canon(parts[0]))) parts.shift();

    const joined = parts.join("/");
    const out = joined ? ("/" + joined + (hadTrailing ? "/" : "")) : "/";
    return normalizeSlashes(out);
  }

  // 把无语言的绝对路径转换成“相对于 appBase 的路径”
  // 例：noLangAbs="/pages/timetrails/feedback", base="/pages/timetrails/" => "/feedback"
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
    const rest = (restRel || "/").replace(/^\//, "");
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

  function setHtmlLang(langLower, metaMap) {
    document.documentElement.setAttribute("lang", htmlLangFor(langLower, metaMap));
  }

  function renderSelect(sel, langs, currentLower) {
    sel.innerHTML = "";
    for (const l of langs) {
      const opt = document.createElement("option");
      opt.value = l.codeLower; // URL/路由用 canonical code
      opt.textContent = l.label; // UI 展示优先 displayName
      if (l.codeLower === currentLower) opt.selected = true;
      sel.appendChild(opt);
    }
  }

  function init() {
    const sel = document.getElementById(SELECT_ID);
    if (!sel) return;

    // 建一个 metaMap：用 canonical code 做 key
    const metaMap = new Map(
      LANGS
        .map((x) => {
          const codeLower = canon(x.code);
          if (!codeLower) return null;
          return [codeLower, { raw_code: x.code, asc_code: x.asc_code, displayName: x.displayName, name: x.name }];
        })
        .filter(Boolean)
    );

    const langs = Array.from(metaMap.entries()).map(([codeLower, meta]) => ({
      codeLower,
      label: meta.displayName || meta.name || meta.raw_code || codeLower,
    }));

    const supported = supportedSet();
    const appBase = inferAppBase(); // "/pages/timetrails/"

    // 当前语言只从根第一段判断
    const fromRoot = detectLangFromRoot(supported);
    const current = supported.has(fromRoot) ? fromRoot : canon(DEFAULT_LANG);

    setHtmlLang(current, metaMap);
    renderSelect(sel, langs, current);

    sel.addEventListener("change", () => {
      const next = canon(sel.value) || canon(DEFAULT_LANG);

      // 先去掉根语言段（如果有）：得到 noLangAbs="/pages/timetrails/feedback"
      const noLangAbs = stripLangFromRoot(supported);

      // 再把它变成 app 内部相对路径："/feedback"
      const restRel = toAppRelative(noLangAbs, appBase);

      // 最后按规则拼出来
      const target = buildTarget(restRel, next, appBase);

      location.href = target + location.search + location.hash;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
