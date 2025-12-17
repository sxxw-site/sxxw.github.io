(function () {
  const SUPPORTED = ["zh-CN", "en"];
  const RTL_SET = new Set(["ar","fa","he","ur"]);
  const qs = new URLSearchParams(location.search);
  const urlLang = qs.get("lang");

  function normLang(l) {
    if (!l) return "zh-CN";
    l = l.toLowerCase();
    if (l.startsWith("zh")) return "zh-CN";
    if (l.startsWith("en")) return "en";
    return "en";
  }

  const stored = localStorage.getItem("lang");
  const browser = (navigator.language || "").toLowerCase();
  let lang = normLang(urlLang || stored || browser);
  if (!SUPPORTED.includes(lang)) lang = "en";

  const $html = document.documentElement;
  const $switcher = document.getElementById("lang-switcher");

  // 防闪烁：在 CSS 里加 html[hidden]{visibility:hidden}
  $html.hidden = true;

  setupLangAttr(lang);
  loadDict(lang).then(dict => {
    applyDict(dict);
    setupSwitcher(lang);
  }).catch(() => {
    setupSwitcher(lang);
  }).finally(() => {
    $html.hidden = false;
  });

  function setupSwitcher(current) {
    if (!$switcher) return;
    $switcher.value = current;
    $switcher.addEventListener("change", (e) => {
      const next = e.target.value;
      setLang(next);
    });
  }

  function setLang(next) {
    localStorage.setItem("lang", next);
    const params = new URLSearchParams(location.search);
    params.set("lang", next);
    // 无刷新也可以：直接重新 loadDict+applyDict
    // 但为保持 URL 可分享，我们刷新一次并保留其它查询参数
    location.search = params.toString();
  }

  function setupLangAttr(l) {
    $html.lang = l;
    const base = l.split("-")[0];
    $html.dir = RTL_SET.has(base) ? "rtl" : "ltr";
  }

  async function loadDict(l) {
    const res = await fetch(`/i18n/${l}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error("i18n load failed");
    return res.json();
  }

  function t(dict, key, fallback) {
    return (dict && dict[key]) || fallback || `[[${key}]]`;
  }

  function applyDict(dict) {
    // 文本节点：data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = t(dict, key, el.textContent.trim());
      // 用 textContent 可避免注入风险；如需富文本，可额外提供 data-i18n-html
      el.textContent = val;
    });

    // 属性：data-i18n-attr-*
    Array.from(document.querySelectorAll("*")).forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (!attr.name.startsWith("data-i18n-attr-")) return;
        const targetAttr = attr.name.replace("data-i18n-attr-", "");
        const key = attr.value;
        const val = t(dict, key, el.getAttribute(targetAttr) || "");
        el.setAttribute(targetAttr, val);
      });
    });

    // <title>
    if (dict["__title"]) document.title = dict["__title"];

    // <meta name="description">
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict["__meta.description"]) {
      metaDesc.setAttribute("content", dict["__meta.description"]);
    }
  }
})();
