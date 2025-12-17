#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import os
import re
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

# =========================
# 配置（按你的项目结构默认值）
# =========================
PROJECT_ROOT = Path(__file__).resolve().parents[1]

SRC_DIR = Path(os.getenv("I18N_SRC_DIR", PROJECT_ROOT / "src"))
DOCS_DIR = Path(os.getenv("I18N_DOCS_DIR", PROJECT_ROOT / "docs"))

LANGS_FILE = Path(os.getenv("I18N_LANGS_FILE", SRC_DIR / "assets" / "languages.json"))
LOCALES_DIR = Path(os.getenv("I18N_LOCALES_DIR", SRC_DIR / "locales"))

BASE = os.getenv("I18N_BASE", "zh-hans")  # 默认语言 code
BASE_AT_ROOT = os.getenv("I18N_BASE_AT_ROOT", "1") == "1"

# 资源目录（会拷贝到 docs/assets）
ASSETS_DIR = SRC_DIR / "assets"
ASSETS_OUT_DIR = DOCS_DIR / "assets"

# 某些特殊词汇：永远原样 copy（不参与翻译/替换）
# - 用于你提的“例外，某些特殊词汇直接copy”
EXEMPT_LITERALS = set(
    x.strip() for x in os.getenv("I18N_EXEMPT_LITERALS", "").split(",") if x.strip()
)

# 变量（支持在翻译文本里写 {company}、{year}）
# company 建议用“对外品牌名”，legal name 仍可用单独 key 管理
DEFAULT_COMPANY = os.getenv("I18N_COMPANY", "上海树下小屋网络科技有限公司")
DEFAULT_YEAR = os.getenv("I18N_YEAR", str(datetime.now().year))

# =========================
# 依赖：BeautifulSoup
# =========================
try:
    from bs4 import BeautifulSoup  # type: ignore
except Exception:
    raise SystemExit("缺少依赖：pip install beautifulsoup4")


# =========================
# 语言配置
# =========================
@dataclass(frozen=True)
class LangSpec:
    code: str
    name: str
    fallbacks: List[str]
    rtl: bool
    html_lang: str  # <html lang="...">

def load_languages() -> List[LangSpec]:
    raw = json.loads(LANGS_FILE.read_text(encoding="utf-8"))
    out: List[LangSpec] = []
    for x in raw:
        code = (x.get("code") or "").strip()
        if not code:
            continue
        rtl = bool(x.get("rtl", False))
        # 优先 languages.json 里给；否则用合理默认
        html_lang = (x.get("htmlLang") or x.get("html_lang") or "").strip()
        if not html_lang:
            html_lang = default_html_lang_for_code(code)

        out.append(
            LangSpec(
                code=code,
                name=(x.get("name") or code),
                fallbacks=list(x.get("fallbacks") or []),
                rtl=rtl,
                html_lang=html_lang,
            )
        )
    return out

def default_html_lang_for_code(code: str) -> str:
    c = code.lower()
    # 你项目里常见的 zh-hans / zh-hant
    if c in {"zh-hans", "zh-cn"}:
        return "zh-CN"
    if c in {"zh-hant", "zh-tw"}:
        return "zh-Hant"
    if c == "zh-hk":
        return "zh-HK"
    # 其他：取主语言子标签
    # en-us -> en-US, pt-br -> pt-BR（简单处理）
    if "-" in code:
        a, b = code.split("-", 1)
        return f"{a.lower()}-{b.upper()}"
    return code.lower()


# =========================
# locale 读取 & fallback 合并
# =========================
JsonObj = Union[Dict[str, Any], List[Any], str, int, float, bool, None]

def read_json(path: Path) -> JsonObj:
    return json.loads(path.read_text(encoding="utf-8"))

def locale_file_for(code: str) -> Path:
    return LOCALES_DIR / f"{code.strip().lower()}.json"

def deep_get(obj: Any, key: str) -> Optional[Any]:
    """
    支持：
    - 平铺 key：{"hero.title": "..."}
    - 分级对象：{"hero":{"title":"..."}}
    - 含数字段：hero.meta.0.num
    """
    if obj is None:
        return None
    if isinstance(obj, dict) and key in obj:
        return obj[key]

    cur: Any = obj
    parts = key.split(".")
    for p in parts:
        if isinstance(cur, dict):
            if p in cur:
                cur = cur[p]
            else:
                return None
        elif isinstance(cur, list):
            if not p.isdigit():
                return None
            idx = int(p)
            if idx < 0 or idx >= len(cur):
                return None
            cur = cur[idx]
        else:
            return None
    return cur

def merge_locales_prefer_first(dicts: List[JsonObj]) -> Dict[str, Any]:
    """
    合并多个 locale，前面的优先级更高（prefer-first）。
    返回一个“视图式”字典（只用于 deep_get），这里为了简单直接保存 list。
    """
    return {"__layers__": dicts}

def locale_lookup(merged: Dict[str, Any], key: str) -> Optional[Any]:
    layers = merged.get("__layers__") or []
    for layer in layers:
        v = deep_get(layer, key)
        if v is not None:
            return v
    return None

def load_locale_with_fallbacks(
        code: str,
        fallbacks: List[str],
        base_code: str,
) -> Dict[str, Any]:
    layers: List[JsonObj] = []

    # 主语言
    fp = locale_file_for(code)
    if fp.exists():
        layers.append(read_json(fp))

    # fallbacks
    for fb in fallbacks:
        fbp = locale_file_for(fb)
        if fbp.exists():
            layers.append(read_json(fbp))

    # base 最后兜底（通常 zh-hans）
    if code.lower() != base_code.lower():
        bp = locale_file_for(base_code)
        if bp.exists():
            layers.append(read_json(bp))

    # 没有任何文件也得返回一个层
    if not layers:
        layers.append({})

    return merge_locales_prefer_first(layers)


# =========================
# 文本插值（company/year 等）
# =========================
_VAR_RE = re.compile(r"\{([a-zA-Z_][a-zA-Z0-9_]*)\}")

def format_vars(text: str, vars_map: Dict[str, str]) -> str:
    if not text:
        return text

    # 例外字面量：整段命中则原样返回
    if text.strip() in EXEMPT_LITERALS:
        return text

    def repl(m: re.Match) -> str:
        k = m.group(1)
        return vars_map.get(k, m.group(0))

    return _VAR_RE.sub(repl, text)


# =========================
# HTML 渲染（data-i18n / data-i18n-html / data-i18n-attr）
# =========================
def parse_i18n_attr_rules(raw: str) -> List[Tuple[str, str]]:
    """
    支持：
    data-i18n-attr="lang:html.lang"
    data-i18n-attr="content:meta.description;aria-label:nav.toggle"
    """
    if not raw:
        return []
    parts = re.split(r"[;,]\s*", raw.strip())
    out: List[Tuple[str, str]] = []
    for p in parts:
        if not p:
            continue
        if ":" not in p:
            continue
        a, k = p.split(":", 1)
        a = a.strip()
        k = k.strip()
        if a and k:
            out.append((a, k))
    return out

def rewrite_asset_url(url: str, depth: int) -> str:
    """
    把 "assets/xxx" 在子目录页面里重写成 "../assets/xxx"（depth=1）
    如果 url 是绝对链接/协议/锚点，不改。
    """
    if not url:
        return url
    u = url.strip()
    if u.startswith(("http://", "https://", "//", "mailto:", "#", "data:")):
        return url
    if u.startswith("/"):
        # 你若用绝对路径 /assets/... 也能在 GH Pages 子路径出问题，
        # 这里不强改，避免误伤；建议你统一用相对 "assets/..."
        return url

    if u.startswith("assets/") and depth > 0:
        prefix = "../" * depth
        return prefix + u
    return url

def apply_i18n_to_html(
        html_text: str,
        merged_locale: Dict[str, Any],
        lang_spec: LangSpec,
        out_depth: int,
        vars_map: Dict[str, str],
) -> str:
    soup = BeautifulSoup(html_text, "html.parser")

    # 1) 设置 <html lang/dir>
    html_tag = soup.find("html")
    if html_tag:
        html_tag["lang"] = lang_spec.html_lang
        if lang_spec.rtl:
            html_tag["dir"] = "rtl"
        else:
            if "dir" in html_tag.attrs:
                del html_tag["dir"]

    # 2) data-i18n：替换 textContent
    for el in soup.select("[data-i18n]"):
        key = el.get("data-i18n", "").strip()
        if not key:
            continue
        val = locale_lookup(merged_locale, key)
        if isinstance(val, (str, int, float, bool)):
            txt = format_vars(str(val), vars_map)
            el.clear()
            el.append(txt)
        # 清理标记
        if "data-i18n" in el.attrs:
            del el.attrs["data-i18n"]

    # 3) data-i18n-html：替换 innerHTML（允许包含 span/dot 等）
    for el in soup.select("[data-i18n-html]"):
        key = el.get("data-i18n-html", "").strip()
        if not key:
            continue
        val = locale_lookup(merged_locale, key)
        if isinstance(val, (str, int, float, bool)):
            html_fragment = format_vars(str(val), vars_map)
            el.clear()
            frag = BeautifulSoup(html_fragment, "html.parser")
            # append frag body contents
            if frag.body:
                for child in list(frag.body.contents):
                    el.append(child)
            else:
                for child in list(frag.contents):
                    el.append(child)
        if "data-i18n-html" in el.attrs:
            del el.attrs["data-i18n-html"]

    # 4) data-i18n-attr：替换属性
    for el in soup.select("[data-i18n-attr]"):
        rules = parse_i18n_attr_rules(el.get("data-i18n-attr", ""))
        for attr_name, key in rules:
            # 特殊：lang:html.lang —— 更推荐 build 直接写 html_lang
            if attr_name == "lang" and key in {"html.lang", "lang"}:
                el[attr_name] = lang_spec.html_lang
                continue

            val = locale_lookup(merged_locale, key)
            if isinstance(val, (str, int, float, bool)):
                el[attr_name] = format_vars(str(val), vars_map)
        if "data-i18n-attr" in el.attrs:
            del el.attrs["data-i18n-attr"]

    # 5) 修正子目录页面的 assets 路径
    # link[href], script[src], img[src] 常见
    for el in soup.find_all(["link", "script", "img"]):
        if el.name == "link" and el.get("href"):
            el["href"] = rewrite_asset_url(el["href"], out_depth)
        if el.name == "script" and el.get("src"):
            el["src"] = rewrite_asset_url(el["src"], out_depth)
        if el.name == "img" and el.get("src"):
            el["src"] = rewrite_asset_url(el["src"], out_depth)

    return str(soup)


# =========================
# 文件遍历：渲染 HTML，拷贝静态资源
# =========================
def iter_html_files(src_root: Path) -> List[Path]:
    out: List[Path] = []
    for p in src_root.rglob("*.html"):
        # 排除 locales、assets 内的 html（若你有）
        rel = p.relative_to(src_root)
        if rel.parts and rel.parts[0] in {"locales", "assets"}:
            continue
        out.append(p)
    return out

def copy_assets() -> None:
    if not ASSETS_DIR.exists():
        return
    ASSETS_OUT_DIR.mkdir(parents=True, exist_ok=True)

    # 拷贝 assets 目录，但可选择排除 languages.json（构建产物一般不需要）
    def ignore(_dir: str, names: List[str]) -> List[str]:
        ignored = []
        for n in names:
            if n.lower() in {""}:
                ignored.append(n)
        return ignored

    shutil.copytree(ASSETS_DIR, ASSETS_OUT_DIR, dirs_exist_ok=True, ignore=ignore)

def ensure_clean_docs() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    # 你如果想每次清空 docs，打开这行：
    # shutil.rmtree(DOCS_DIR); DOCS_DIR.mkdir(parents=True, exist_ok=True)

def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


# =========================
# 主构建
# =========================
def build() -> None:
    if not LANGS_FILE.exists():
        raise SystemExit(f"找不到 languages.json: {LANGS_FILE}")
    if not LOCALES_DIR.exists():
        raise SystemExit(f"找不到 locales 目录: {LOCALES_DIR}")
    if not SRC_DIR.exists():
        raise SystemExit(f"找不到 src 目录: {SRC_DIR}")

    langs = load_languages()
    if not langs:
        raise SystemExit("languages.json 里没有可用语言配置")

    ensure_clean_docs()
    copy_assets()

    html_files = iter_html_files(SRC_DIR)
    if not html_files:
        raise SystemExit("src 下没有发现 html 文件")

    # 构建变量（可按语言定制：例如 en 用英文品牌名）
    # 你也可以扩展：vars_map_by_lang[code] = {...}
    vars_map_base = {
        "company": DEFAULT_COMPANY,
        "year": DEFAULT_YEAR,
    }

    for lang in langs:
        code = lang.code.strip().lower()

        merged = load_locale_with_fallbacks(code, lang.fallbacks, BASE)

        # 输出目录规则
        is_base = (code == BASE.lower())
        if is_base and BASE_AT_ROOT:
            out_root = DOCS_DIR
            depth = 0
        else:
            out_root = DOCS_DIR / code
            depth = 1

        # 按语言定制变量（示例：英文品牌名）
        vars_map = dict(vars_map_base)
        # 你想 en 下公司名显示英文：可以这样（按需改）
        if code.startswith("en"):
            vars_map["company"] = os.getenv("I18N_COMPANY_EN", vars_map["company"])

        print(f"\n=== build: {code} -> {out_root}  (html.lang={lang.html_lang}, rtl={lang.rtl})")

        for src_html in html_files:
            rel = src_html.relative_to(SRC_DIR)
            out_path = out_root / rel

            html_text = src_html.read_text(encoding="utf-8")

            rendered = apply_i18n_to_html(
                html_text=html_text,
                merged_locale=merged,
                lang_spec=lang,
                out_depth=depth,
                vars_map=vars_map,
            )

            write_file(out_path, rendered)
            print(f"  ✅ {rel.as_posix()}")

    print("\n✅ build 完成")
    print(f"   输出目录：{DOCS_DIR}")
    print("   提示：GitHub Pages 直接指向 docs/ 即可")


if __name__ == "__main__":
    build()
