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
# 配置
# =========================
PROJECT_ROOT = Path(__file__).resolve().parents[1]

SRC_DIR = Path(os.getenv("I18N_SRC_DIR", PROJECT_ROOT / "src"))
DOCS_DIR = Path(os.getenv("I18N_DOCS_DIR", PROJECT_ROOT / "docs"))

LANGS_FILE = Path(os.getenv("I18N_LANGS_FILE", SRC_DIR / "assets" / "languages.json"))
LOCALES_DIR = Path(os.getenv("I18N_LOCALES_DIR", SRC_DIR / "locales"))

BASE = os.getenv("I18N_BASE", "zh-hans")  # 默认语言（用于判断 base）
# ✅ 你的要求：根目录也要放一份 + zh-Hans 也要
BASE_ALSO_AT_ROOT = os.getenv("I18N_BASE_ALSO_AT_ROOT", "1") == "1"

ASSETS_DIR = SRC_DIR / "assets"
ASSETS_OUT_DIR = DOCS_DIR / "assets"

EXEMPT_LITERALS = set(
    x.strip() for x in os.getenv("I18N_EXEMPT_LITERALS", "").split(",") if x.strip()
)

DEFAULT_COMPANY = os.getenv("I18N_COMPANY", "上海树下小屋网络科技有限公司")
DEFAULT_YEAR = os.getenv("I18N_YEAR", str(datetime.now().year))

# ✅ 全站防暗色首帧“闪白”注入（可用 env 关闭/改色）
INJECT_CRITICAL_HEAD = os.getenv("I18N_INJECT_CRITICAL_HEAD", "1") == "2"
CRITICAL_DARK_BG = os.getenv("I18N_CRITICAL_DARK_BG", "#0b1020")
CRITICAL_LIGHT_BG = os.getenv("I18N_CRITICAL_LIGHT_BG", "#f8fafc")

try:
    from bs4 import BeautifulSoup  # type: ignore
except Exception:
    raise SystemExit("缺少依赖：pip install beautifulsoup4")


# =========================
# utils
# =========================
def norm_code(code: str) -> str:
    """用于比较/读取 locale：统一小写、统一 '-'"""
    return (code or "").strip().replace("_", "-").lower()


def default_html_lang_for_code(code: str) -> str:
    c = norm_code(code)
    if c in {"zh-hans", "zh-cn"}:
        return "zh-CN"
    if c in {"zh-hant", "zh-tw"}:
        return "zh-Hant"
    if c == "zh-hk":
        return "zh-HK"
    if "-" in code:
        a, b = code.split("-", 1)
        return f"{a.lower()}-{b.upper()}"
    return c


def normalize_slashes(path: str) -> str:
    return (path or "").replace("\\", "/")


# =========================
# 语言配置
# =========================
@dataclass(frozen=True)
class LangSpec:
    code: str           # 原始 code（严格按 languages.json）
    name: str
    fallbacks: List[str]
    rtl: bool
    html_lang: str


def load_languages() -> List[LangSpec]:
    raw = json.loads(LANGS_FILE.read_text(encoding="utf-8"))
    out: List[LangSpec] = []
    for x in raw:
        code = (x.get("code") or "").strip()
        if not code:
            continue
        rtl = bool(x.get("rtl", False))
        html_lang = (x.get("htmlLang") or x.get("html_lang") or "").strip()
        if not html_lang:
            html_lang = default_html_lang_for_code(code)

        out.append(
            LangSpec(
                code=code,  # ✅ 保留原样（大小写不动）
                name=(x.get("name") or code),
                fallbacks=list(x.get("fallbacks") or []),
                rtl=rtl,
                html_lang=html_lang,
            )
        )
    return out


# =========================
# locale 读取 & fallback 合并
# =========================
JsonObj = Union[Dict[str, Any], List[Any], str, int, float, bool, None]


def read_json(path: Path) -> JsonObj:
    return json.loads(path.read_text(encoding="utf-8"))


def locale_file_for(code: str) -> Path:
    # ✅ locale 文件统一按 norm 名称：en-GB -> en-gb.json
    return LOCALES_DIR / f"{norm_code(code)}.json"


def deep_get(obj: Any, key: str) -> Optional[Any]:
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
    return {"__layers__": dicts}


def locale_lookup(merged: Dict[str, Any], key: str) -> Optional[Any]:
    layers = merged.get("__layers__") or []
    for layer in layers:
        v = deep_get(layer, key)
        if v is not None:
            return v
    return None


def load_locale_with_fallbacks(code: str, fallbacks: List[str], base_code: str) -> Dict[str, Any]:
    layers: List[JsonObj] = []

    fp = locale_file_for(code)
    if fp.exists():
        layers.append(read_json(fp))

    for fb in fallbacks:
        fbp = locale_file_for(fb)
        if fbp.exists():
            layers.append(read_json(fbp))

    if norm_code(code) != norm_code(base_code):
        bp = locale_file_for(base_code)
        if bp.exists():
            layers.append(read_json(bp))

    if not layers:
        layers.append({})

    return merge_locales_prefer_first(layers)


# =========================
# 文本插值
# =========================
_VAR_RE = re.compile(r"\{([a-zA-Z_][a-zA-Z0-9_]*)\}")


def format_vars(text: str, vars_map: Dict[str, str]) -> str:
    if not text:
        return text
    if text.strip() in EXEMPT_LITERALS:
        return text

    def repl(m: re.Match) -> str:
        k = m.group(1)
        return vars_map.get(k, m.group(0))

    return _VAR_RE.sub(repl, text)


# =========================
# ✅ 防暗色首帧闪白：注入 critical head
# =========================
def ensure_critical_head(soup: BeautifulSoup, dark_bg: str, light_bg: str) -> None:
    head = soup.find("head")
    if not head:
        return

    # 防重复注入（marker）
    if head.find("meta", attrs={"name": "i18n-critical-head"}):
        return

    marker = soup.new_tag("meta")
    marker["name"] = "i18n-critical-head"
    marker["content"] = "1"

    # 提前声明配色能力（首帧更稳）
    cs = soup.new_tag("meta")
    cs["name"] = "color-scheme"
    cs["content"] = "dark light"

    # 首帧兜底背景（关键：CSS 未加载前也不白）
    style = soup.new_tag("style")
    style.string = (
        f"html,body{{background:{dark_bg};}}"
        f"@media (prefers-color-scheme: light){{html,body{{background:{light_bg};}}}}"
    )

    # 顶栏颜色（可选但建议）
    theme_dark = soup.new_tag("meta")
    theme_dark["name"] = "theme-color"
    theme_dark["media"] = "(prefers-color-scheme: dark)"
    theme_dark["content"] = dark_bg

    theme_light = soup.new_tag("meta")
    theme_light["name"] = "theme-color"
    theme_light["media"] = "(prefers-color-scheme: light)"
    theme_light["content"] = light_bg

    # 插到 head 最前（越早越好）
    head.insert(0, theme_light)
    head.insert(0, theme_dark)
    head.insert(0, style)
    head.insert(0, cs)
    head.insert(0, marker)


# =========================
# HTML 渲染（data-i18n / data-i18n-html / data-i18n-attr）
# =========================
def parse_i18n_attr_rules(raw: str) -> List[Tuple[str, str]]:
    if not raw:
        return []
    parts = re.split(r"[;,]\s*", raw.strip())
    out: List[Tuple[str, str]] = []
    for p in parts:
        if not p or ":" not in p:
            continue
        a, k = p.split(":", 1)
        a = a.strip()
        k = k.strip()
        if a and k:
            out.append((a, k))
    return out


def rewrite_asset_url(url: str, depth: int) -> str:
    """
    将 "assets/..." 重写为 "../"*depth + "assets/..."
    depth 按页面层级动态计算
    """
    if not url:
        return url
    u = url.strip()
    if u.startswith(("http://", "https://", "//", "mailto:", "#", "data:")):
        return url
    if u.startswith("/"):
        return url
    if u.startswith("assets/") and depth > 0:
        return normalize_slashes("../" * depth + u)
    return url


def apply_i18n_to_html(
    html_text: str,
    merged_locale: Dict[str, Any],
    lang_spec: LangSpec,
    out_depth: int,
    vars_map: Dict[str, str],
) -> str:
    soup = BeautifulSoup(html_text, "html.parser")

    # ✅ 全局注入防闪白（每个输出 HTML 都会带上）
    if INJECT_CRITICAL_HEAD:
        ensure_critical_head(soup, CRITICAL_DARK_BG, CRITICAL_LIGHT_BG)

    html_tag = soup.find("html")
    if html_tag:
        html_tag["lang"] = lang_spec.html_lang
        if lang_spec.rtl:
            html_tag["dir"] = "rtl"
        else:
            html_tag.attrs.pop("dir", None)

    for el in soup.select("[data-i18n]"):
        key = (el.get("data-i18n") or "").strip()
        if not key:
            continue
        val = locale_lookup(merged_locale, key)
        if isinstance(val, (str, int, float, bool)):
            el.clear()
            el.append(format_vars(str(val), vars_map))
        el.attrs.pop("data-i18n", None)

    for el in soup.select("[data-i18n-html]"):
        key = (el.get("data-i18n-html") or "").strip()
        if not key:
            continue
        val = locale_lookup(merged_locale, key)
        if isinstance(val, (str, int, float, bool)):
            html_fragment = format_vars(str(val), vars_map)
            el.clear()
            frag = BeautifulSoup(html_fragment, "html.parser")
            if frag.body:
                for child in list(frag.body.contents):
                    el.append(child)
            else:
                for child in list(frag.contents):
                    el.append(child)
        el.attrs.pop("data-i18n-html", None)

    for el in soup.select("[data-i18n-attr]"):
        rules = parse_i18n_attr_rules(el.get("data-i18n-attr", ""))
        for attr_name, key in rules:
            val = locale_lookup(merged_locale, key)
            if isinstance(val, (str, int, float, bool)):
                el[attr_name] = format_vars(str(val), vars_map)
        el.attrs.pop("data-i18n-attr", None)

    for el in soup.find_all(["link", "script", "img"]):
        if el.name == "link" and el.get("href"):
            el["href"] = rewrite_asset_url(el["href"], out_depth)
        if el.name == "script" and el.get("src"):
            el["src"] = rewrite_asset_url(el["src"], out_depth)
        if el.name == "img" and el.get("src"):
            el["src"] = rewrite_asset_url(el["src"], out_depth)

    return str(soup)


# =========================
# 文件遍历 & 拷贝
# =========================
def iter_html_files(src_root: Path) -> List[Path]:
    out: List[Path] = []
    for p in src_root.rglob("*.html"):
        rel = p.relative_to(src_root)
        if rel.parts and rel.parts[0] in {"locales", "assets"}:
            continue
        out.append(p)
    return out


def copy_assets() -> None:
    if not ASSETS_DIR.exists():
        return
    ASSETS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copytree(ASSETS_DIR, ASSETS_OUT_DIR, dirs_exist_ok=True)


def ensure_clean_docs() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    # 如需每次清空 docs：取消注释
    # shutil.rmtree(DOCS_DIR); DOCS_DIR.mkdir(parents=True, exist_ok=True)


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


# =========================
# 主构建：语言目录 + base 根目录再放一份
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

    vars_map_base = {"company": DEFAULT_COMPANY, "year": DEFAULT_YEAR}
    base_n = norm_code(BASE)

    for lang in langs:
        raw_code = (lang.code or "").strip()   # 原始 code（仅用于展示/日志）
        code_n = norm_code(raw_code)           # ✅ 逻辑/locale 读取用这个（小写）
        out_dir_name = code_n                  # ✅ 输出目录统一小写

        merged = load_locale_with_fallbacks(code_n, lang.fallbacks, base_n)

        # ✅ 必输出：docs/<code_n>/  (目录名小写)
        out_roots: List[Tuple[Path, str]] = [(DOCS_DIR / out_dir_name, f"dir:{out_dir_name}")]

        # ✅ base 另外输出一份到 docs/ 根目录
        if BASE_ALSO_AT_ROOT and (code_n == base_n):
            out_roots.append((DOCS_DIR, "root"))

        vars_map = dict(vars_map_base)
        if code_n.startswith("en"):
            vars_map["company"] = os.getenv("I18N_COMPANY_EN", vars_map["company"])

        print(f"\n=== build: {raw_code} -> {out_dir_name}  (html.lang={lang.html_lang}, rtl={lang.rtl})")
        for out_root, tag in out_roots:
            print(f" -> output [{tag}]: {out_root}")

            for src_html in html_files:
                rel = src_html.relative_to(SRC_DIR)
                out_path = out_root / rel

                # ✅ depth 动态：pages/timetrails/private.html => depth=2
                depth = max(0, len(rel.parents) - 1)

                html_text = src_html.read_text(encoding="utf-8")
                rendered = apply_i18n_to_html(
                    html_text=html_text,
                    merged_locale=merged,
                    lang_spec=lang,
                    out_depth=depth,
                    vars_map=vars_map,
                )

                write_file(out_path, rendered)

            print(f"   ✅ wrote {len(html_files)} html files")

    print("\n✅ build 完成")
    print(f"   输出目录：{DOCS_DIR}")
    print("   base 语言：同时输出到 docs/ 与 docs/<base_code>/（目录名统一小写）")
    if INJECT_CRITICAL_HEAD:
        print(f"   ✅ 已注入 critical head：dark={CRITICAL_DARK_BG} light={CRITICAL_LIGHT_BG}")
    else:
        print("   ⛔ 未注入 critical head（I18N_INJECT_CRITICAL_HEAD=0）")


if __name__ == "__main__":
    build()
