from __future__ import annotations

import json
import os
import re
import time
import random
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Tuple, Optional, Union, Callable

try:
    from openai import OpenAI  # openai>=1.x
except Exception:
    OpenAI = None


# =========================
# 固定配置（从项目根目录执行：python3 scripts/i18n_tool.py）
# =========================
LANGS_FILE = Path("src/assets/languages.json")
DEFAULT_LOCALES_DIR_CANDIDATES = [Path("src/locales"), Path("locales")]

# 你的基础文件实际是：src/locales/zh-hans.json
BASE = "zh-hans"
FIRST_HOP = ["en", "zh-hant", "ja", "ko"]

MODEL = "gpt-4o-mini"

# ✅ 并发线程数（1 = 不并发；>1 = 多线程并发）
# 可通过环境变量控制：I18N_WORKERS=6 python3 scripts/i18n_tool.py
MAX_WORKERS = int(os.getenv("I18N_WORKERS", "6"))

CACHE_FILE = Path(".cache/i18n_translate_cache.json")
APIKEY_FILE = Path("scripts/apikey")

# ✅ 不翻译保护词（整句命中直接 copy；句子内出现会被掩码，翻完还原）
# 文件格式：["TreeHouse Tech", "上海树下小屋网络科技有限公司", "sxxw.site"]
PROTECTED_TERMS_FILE = Path("scripts/protected_terms.json")


# =========================
# 占位符保护 & CJK 处理
# =========================
_CJK_RE = re.compile(r"[\u3400-\u9FFF\uF900-\uFAFF]")  # CJK 表意 + 兼容区
_PLACEHOLDER_RE = re.compile(
    r"(%\d*\$?[sd]|%\d*\.?\d*[df]|%@|{[^{}]+}|{[0-9]+}|{{[^{}]+}}|<\/?[^>]+>)"
)

def is_zh(code: str) -> bool:
    return (code or "").lower().startswith("zh")

def is_cjk(code: str) -> bool:
    c = (code or "").lower()
    return c.startswith("zh") or c.startswith("ja") or c.startswith("ko")

def ensure_no_cjk_when_forbidden(text: str, tgt_locale: str) -> str:
    if not text:
        return text
    if is_cjk(tgt_locale):
        return text
    return _CJK_RE.sub("", text).strip()

def extract_placeholders(s: str) -> List[str]:
    return _PLACEHOLDER_RE.findall(s or "")

def placeholders_equal(src: str, tgt: str) -> bool:
    return extract_placeholders(src) == extract_placeholders(tgt)

def mask_placeholders(text: str) -> Tuple[str, Dict[str, str]]:
    mapping: Dict[str, str] = {}
    idx = 0

    def repl(m: re.Match) -> str:
        nonlocal idx
        token = f"__PH{idx}__"
        mapping[token] = m.group(0)
        idx += 1
        return token

    return _PLACEHOLDER_RE.sub(repl, text), mapping

def unmask_placeholders(text: str, mapping: Dict[str, str]) -> str:
    for k, v in mapping.items():
        text = text.replace(k, v)
    return text


# =========================
# 保护词：掩码/还原
# =========================
_TERM_TOKEN_RE = re.compile(r"__TERM(\d+)__")

def load_protected_terms() -> List[str]:
    # env: I18N_PROTECTED_TERMS="foo,bar,baz"
    env = (os.getenv("I18N_PROTECTED_TERMS") or "").strip()
    terms: List[str] = []
    if env:
        terms.extend([x.strip() for x in env.split(",") if x.strip()])

    if PROTECTED_TERMS_FILE.exists():
        try:
            data = json.loads(PROTECTED_TERMS_FILE.read_text(encoding="utf-8"))
            if isinstance(data, list):
                terms.extend([str(x) for x in data if str(x).strip()])
        except Exception:
            pass

    # 去重 + 长度降序（避免短词先替换导致长词无法匹配）
    uniq: List[str] = []
    seen = set()
    for t in terms:
        if t not in seen:
            uniq.append(t)
            seen.add(t)
    uniq.sort(key=len, reverse=True)
    return uniq

def mask_protected_terms(text: str, terms: List[str]) -> Tuple[str, Dict[str, str]]:
    """
    把 text 里出现的保护词替换成 __TERM0__/__TERM1__...，避免被模型翻译
    """
    if not text or not terms:
        return text, {}

    mapping: Dict[str, str] = {}
    out = text
    idx = 0
    for term in terms:
        if not term:
            continue
        if term in out:
            token = f"__TERM{idx}__"
            mapping[token] = term
            out = out.replace(term, token)
            idx += 1
    return out, mapping

def unmask_protected_terms(text: str, mapping: Dict[str, str]) -> str:
    if not text or not mapping:
        return text
    for k, v in mapping.items():
        text = text.replace(k, v)
    return text


# =========================
# Path tokenization + 排序 Key（仅用于“排序选项”/前缀匹配）
# =========================
Token = Union[str, int]

def parse_path_tokens(path: str) -> List[Token]:
    tokens: List[Token] = []
    i = 0
    while i < len(path):
        if path[i] == "[":
            j = path.index("]", i)
            tokens.append(int(path[i + 1 : j]))
            i = j + 1
        elif path[i] == ".":
            i += 1
        else:
            j = i
            while j < len(path) and path[j] not in ".[":
                j += 1
            tokens.append(path[i:j])
            i = j
    return tokens

def path_sort_key(path: str) -> Tuple:
    toks = parse_path_tokens(path)
    key = []
    for t in toks:
        if isinstance(t, int):
            key.append((0, t))
        else:
            key.append((1, t))
    return tuple(key)


# =========================
# JSON 扁平化（保持插入顺序）
# 注意：如果源文件本来就是平铺 key（含 . 或 []），这里不会拆 key
# =========================
def flatten_json(obj: Any, prefix: str = "") -> List[Tuple[str, Any]]:
    out: List[Tuple[str, Any]] = []
    if isinstance(obj, dict):
        for k, v in obj.items():  # insertion-order
            p = f"{prefix}.{k}" if prefix else str(k)
            out.extend(flatten_json(v, p))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            p = f"{prefix}[{i}]"
            out.extend(flatten_json(v, p))
    else:
        out.append((prefix, obj))
    return out

def pairs_to_flat_dict(pairs: List[Tuple[str, Any]]) -> Dict[str, Any]:
    d: Dict[str, Any] = {}
    for k, v in pairs:
        d[k] = v
    return d

def write_json_preserve_order(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def atomic_write_json(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)


# =========================
# locale 文件命名（统一小写，避免大小写平台差异）
# =========================
def code_to_filename(code: str) -> str:
    return f"{(code or '').strip().lower()}.json"

def locale_path(locales_dir: Path, code: str) -> Path:
    return locales_dir / code_to_filename(code)


# =========================
# 语言清单读取
# =========================
@dataclass(frozen=True)
class LangSpec:
    code: str
    name: str
    fallbacks: List[str]
    rtl: bool

def load_languages() -> List[LangSpec]:
    data = json.loads(LANGS_FILE.read_text(encoding="utf-8"))
    out: List[LangSpec] = []
    for x in data:
        out.append(
            LangSpec(
                code=x["code"],
                name=x.get("name") or x["code"],
                fallbacks=x.get("fallbacks") or [],
                rtl=bool(x.get("rtl", False)),
            )
        )
    return out

def pick_locales_dir() -> Path:
    for p in DEFAULT_LOCALES_DIR_CANDIDATES:
        if p.exists():
            return p
    DEFAULT_LOCALES_DIR_CANDIDATES[0].mkdir(parents=True, exist_ok=True)
    return DEFAULT_LOCALES_DIR_CANDIDATES[0]


# =========================
# API Key（优先 env，其次读取 scripts/apikey）
# =========================
def read_api_key() -> str:
    env = (os.getenv("OPENAI_API_KEY") or "").strip()
    if env:
        return env
    if APIKEY_FILE.exists():
        key = APIKEY_FILE.read_text(encoding="utf-8").strip()
        if key:
            return key
    raise RuntimeError("未找到 OpenAI API Key：请设置 OPENAI_API_KEY 或在 scripts/apikey 写入 key")


# =========================
# 缓存
# =========================
def load_cache() -> Dict[str, str]:
    if not CACHE_FILE.exists():
        return {}
    try:
        return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}

def save_cache(cache: Dict[str, str]) -> None:
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def cache_key(src_lang: str, tgt_lang: str, text: str) -> str:
    return f"{src_lang}|||{tgt_lang}|||{text}"


# =========================
# OpenCC：中文简繁直转（可选）
# =========================
def opencc_convert_if_possible(src_text: str, src_lang: str, tgt_lang: str) -> Optional[str]:
    s = (src_lang or "").lower()
    t = (tgt_lang or "").lower()
    if not (s.startswith("zh") and t.startswith("zh")):
        return None
    try:
        import opencc  # pip install opencc
        if "hant" in t or t.endswith(("tw", "hk")):
            return opencc.OpenCC("s2t.json").convert(src_text)
        if "hans" in t or t.endswith(("cn",)):
            return opencc.OpenCC("t2s.json").convert(src_text)
    except Exception:
        return None
    return None


# =========================
# 翻译请求（核心）
# =========================
def build_system_prompt(src_lang_name: str, tgt_lang_name: str, tgt_code: str) -> str:
    rules = [
        "You are a senior localization translator.",
        f"Translate from {src_lang_name} to {tgt_lang_name}.",
        "Preserve brand names and URLs verbatim.",
        "Preserve placeholders/tokens EXACTLY (e.g., {name}, {0}, %d, %@, {{count}}, __PH0__, __TERM0__).",
        "Return ONLY valid JSON (no markdown, no extra text).",
        'JSON schema: {"items":[{"path":"...","text":"..."}]}',
        "Do not change any path value.",
    ]
    if not is_zh(tgt_code):
        rules.append("IMPORTANT: Do NOT use any Chinese characters in the output.")
    return " ".join(rules)

def call_openai_batch(
        client: OpenAI,
        model: str,
        src_lang_name: str,
        tgt_lang_name: str,
        tgt_code: str,
        batch: List[Tuple[str, str]],  # [(path, masked_text)]
        timeout: float = 60.0,
        max_retries: int = 4,
) -> Dict[str, str]:
    payload = {"items": [{"path": p, "text": t} for p, t in batch]}
    sys_prompt = build_system_prompt(src_lang_name, tgt_lang_name, tgt_code)

    last_err: Optional[Exception] = None
    for attempt in range(max_retries):
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
                ],
                temperature=0.2 if attempt == 0 else 0.0,
                top_p=0.9,
                timeout=timeout,
            )
            out = (resp.choices[0].message.content or "").strip()
            data = json.loads(out)

            items = data.get("items") or []
            result: Dict[str, str] = {}
            for it in items:
                p = it.get("path")
                txt = it.get("text")
                if isinstance(p, str) and isinstance(txt, str):
                    result[p] = txt.strip()

            if len(result) >= max(1, int(0.85 * len(batch))):
                return result

            raise ValueError("Batch parse ok but too few items returned.")
        except Exception as e:
            last_err = e
            time.sleep((2 ** attempt) + random.uniform(0, 0.25))

    raise RuntimeError(f"Batch translate failed: {last_err}")


# =========================
# 日志回调：打印 key / 原文 / 目标语言 / 译文
# =========================
def default_log_translation(tgt_code: str, path: str, src_text: str, tgt_text: str) -> None:
    print(f"[{tgt_code}] {path}", flush=True)
    print(f"  SRC: {src_text}", flush=True)
    print(f"  TGT: {tgt_text}\n", flush=True)


def translate_tree(
        *,
        base_obj: Any,
        base_code: str,
        src_lang_name: str,
        tgt_code: str,
        tgt_lang_name: str,
        model: str,
        api_key: str,
        existing_obj: Optional[Any],
        cache: Dict[str, str],
        force_full: bool,
        protected_terms: Optional[List[str]] = None,
        out_path: Optional[Path] = None,   # ✅ 边翻译边写
        log_translation: Optional[Callable[[str, str, str, str], None]] = None,
) -> Any:
    """
    force_full=False：增量追加（只补缺失/空字段），新增字段追加到文件末尾
    force_full=True ：全量覆盖（按 base 的遍历顺序生成）

    输出：永远是“平铺 JSON”（不分级），key 与源文件一致
    并发：MAX_WORKERS
    进度：completed/total 单调递增（并发不会“看起来错乱”）
    边翻译边写：每完成一条 atomic 写回 out_path
    保护词：整句命中直接 copy；句子中出现会掩码，翻完还原
    """
    log_translation = log_translation or default_log_translation
    protected_terms = protected_terms or []

    # ---- 中文同语系：OpenCC 直转（如果可用，非 GPT）----
    if is_zh(base_code) and is_zh(tgt_code):
        base_pairs = flatten_json(base_obj)
        out_pairs: List[Tuple[str, Any]] = []
        for path, val in base_pairs:
            if isinstance(val, str):
                direct = opencc_convert_if_possible(val, base_code, tgt_code)
                out_pairs.append((path, direct if direct is not None else val))
            else:
                out_pairs.append((path, val))
        out_dict = pairs_to_flat_dict(out_pairs)
        if out_path:
            atomic_write_json(out_path, out_dict)
        return out_dict

    if not OpenAI:
        raise SystemExit("OpenAI SDK 未安装：pip install openai>=1.0.0")

    base_pairs = flatten_json(base_obj)
    base_map: Dict[str, Any] = {p: v for p, v in base_pairs}

    existing_pairs = flatten_json(existing_obj) if existing_obj is not None else []
    existing_map: Dict[str, Any] = {p: v for p, v in existing_pairs}

    # =========================
    # ✅ 先搭出最终 out_dict（确保写出的 key 顺序稳定）
    # =========================
    out_dict: Dict[str, Any] = {}

    if force_full:
        for path, val in base_pairs:
            if isinstance(val, str):
                out_dict[path] = ""
            else:
                out_dict[path] = val
    else:
        # 先保留 existing 的顺序
        for p, v in existing_pairs:
            out_dict[p] = v

        # 再补 base 中缺失的非字符串项
        for path, val in base_pairs:
            if path in out_dict:
                continue
            if not isinstance(val, str):
                out_dict[path] = val

        # 再补 base 中缺失的字符串项占位（保证后续覆盖不改变顺序）
        for path, val in base_pairs:
            if path in out_dict:
                continue
            if isinstance(val, str):
                out_dict[path] = ""

    # =========================
    # todo + 映射（占位符/保护词）
    # =========================
    todo: List[Tuple[int, str, str]] = []  # (seq, path, masked_src)
    masked_maps: Dict[str, Dict[str, str]] = {}
    term_maps: Dict[str, Dict[str, str]] = {}

    seq = 0
    for path, val in base_pairs:
        if not isinstance(val, str):
            continue

        # 增量：已有非空译文就跳过
        if not force_full:
            cur = existing_map.get(path, None)
            if isinstance(cur, str) and cur.strip() != "":
                continue

        # ✅ 例外：整句命中保护词 -> 直接 copy，不走翻译
        if val.strip() in protected_terms:
            out_dict[path] = val
            ck = cache_key(src_lang_name, tgt_code, val)
            cache[ck] = val
            continue

        # cache 命中 -> 直接填
        ck = cache_key(src_lang_name, tgt_code, val)
        if ck in cache:
            out_dict[path] = cache[ck]
            continue

        # ✅ 先占位符掩码，再保护词掩码
        masked, ph_map = mask_placeholders(val)
        masked, tm_map = mask_protected_terms(masked, protected_terms)

        masked_maps[path] = ph_map
        term_maps[path] = tm_map

        seq += 1
        todo.append((seq, path, masked))

    # 先写一次骨架（含 cache/保护词直拷贝结果），方便你“边翻译边看到文件变化”
    if out_path:
        atomic_write_json(out_path, out_dict)

    total = len(todo)
    mode = "并发" if MAX_WORKERS > 1 else "单线程"
    if total > 0:
        print(f"🧩 [{tgt_code}] 待翻译 {total} 条（{mode}，每条完成即日志 + 写文件）", flush=True)

    lock = threading.Lock()
    completed = 0
    succeeded = 0

    def postprocess(path: str, masked_tgt: str) -> Optional[str]:
        src_text = base_map.get(path)
        if not isinstance(src_text, str):
            return None

        # 先还原占位符，再还原保护词
        unmasked = unmask_placeholders(masked_tgt, masked_maps.get(path, {}))
        unmasked = unmask_protected_terms(unmasked, term_maps.get(path, {}))

        # 非 CJK 目标语言去掉中文（保留你原逻辑）
        unmasked = ensure_no_cjk_when_forbidden(unmasked, tgt_code)

        # 占位符一致性修复
        if extract_placeholders(src_text) and not placeholders_equal(src_text, unmasked):
            src_ph = extract_placeholders(src_text)
            it = iter(src_ph)

            def repl(m: re.Match) -> str:
                return next(it, m.group(0))

            unmasked = _PLACEHOLDER_RE.sub(repl, unmasked)

        return unmasked

    # 每线程复用一个 client
    _tl = threading.local()

    def get_client() -> OpenAI:
        c = getattr(_tl, "client", None)
        if c is None:
            _tl.client = OpenAI(api_key=api_key)
            c = _tl.client
        return c

    def translate_one(path: str, masked_src: str) -> Optional[str]:
        client = get_client()
        out_map = call_openai_batch(
            client=client,
            model=model,
            src_lang_name=src_lang_name,
            tgt_lang_name=tgt_lang_name,
            tgt_code=tgt_code,
            batch=[(path, masked_src)],  # ✅ 永远单条
        )
        if path not in out_map:
            return None
        return postprocess(path, out_map[path])

    def apply_success(seq_no: int, path: str, final: str) -> None:
        nonlocal succeeded
        src_text = base_map.get(path)

        with lock:
            out_dict[path] = final
            if isinstance(src_text, str):
                cache[cache_key(src_lang_name, tgt_code, src_text)] = final
            succeeded += 1
            if out_path:
                atomic_write_json(out_path, out_dict)

        log_translation(tgt_code, path, src_text if isinstance(src_text, str) else "", final)

    def tick_complete(ok: bool, seq_no: int, path: str) -> None:
        nonlocal completed
        with lock:
            completed += 1
            c = completed
        status = "✅" if ok else "⚠️"
        print(f"{status} [{tgt_code}] ({c}/{total})  {path}  (seq:{seq_no})", flush=True)

    # =========================
    # 执行：单线程 or 并发
    # =========================
    if MAX_WORKERS <= 1:
        for seq_no, path, masked_src in todo:
            print(f"⏳ [{tgt_code}] start (seq:{seq_no}/{total})  {path}", flush=True)
            final = translate_one(path, masked_src)
            if final is None:
                tick_complete(False, seq_no, path)
                continue
            apply_success(seq_no, path, final)
            tick_complete(True, seq_no, path)
    else:
        from concurrent.futures import ThreadPoolExecutor, as_completed

        def worker(seq_no: int, path: str, masked_src: str) -> Tuple[int, str, Optional[str]]:
            final = translate_one(path, masked_src)
            return seq_no, path, final

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
            futures = [ex.submit(worker, seq_no, path, masked_src) for seq_no, path, masked_src in todo]
            for fut in as_completed(futures):
                seq_no, path, final = fut.result()
                if final is None:
                    tick_complete(False, seq_no, path)
                    continue
                apply_success(seq_no, path, final)
                tick_complete(True, seq_no, path)

    # 最终保险落盘 + 缓存保存交给上层
    if out_path:
        with lock:
            atomic_write_json(out_path, out_dict)

    if total > 0:
        print(f"🏁 [{tgt_code}] 完成：成功 {succeeded}/{total}", flush=True)

    return out_dict


# =========================
# 第一阶段 / 第二阶段（支持增量追加 & 全量覆盖）
# =========================
def build_first_hop(locales_dir: Path, api_key: str, force_full: bool, protected_terms: List[str]) -> None:
    langs = load_languages()
    lang_by_code = {l.code.lower(): l for l in langs}
    cache = load_cache()

    base_path = locale_path(locales_dir, BASE)
    if not base_path.exists():
        raise FileNotFoundError(f"找不到基础语言文件：{base_path}")

    base_obj = json.loads(base_path.read_text(encoding="utf-8"))

    def lang_name(code: str) -> str:
        return (lang_by_code.get(code.lower()).name if code.lower() in lang_by_code else code)

    for code in FIRST_HOP:
        out_path = locale_path(locales_dir, code)
        existing = None
        if out_path.exists() and not force_full:
            existing = json.loads(out_path.read_text(encoding="utf-8"))

        translate_tree(
            base_obj=base_obj,
            base_code=BASE,
            src_lang_name="Chinese (Simplified)",
            tgt_code=code,
            tgt_lang_name=f"{lang_name(code)} [{code}]",
            model=MODEL,
            api_key=api_key,
            existing_obj=existing,
            cache=cache,
            force_full=force_full,
            protected_terms=protected_terms,
            out_path=out_path,  # ✅ 边翻译边写
        )

        mode = "全量覆盖" if force_full else "增量追加"
        print(f"✅ 第一阶段{mode}：{out_path}", flush=True)

    save_cache(cache)
    print(f"💾 缓存已保存：{CACHE_FILE}", flush=True)


def build_second_hop_from_en(locales_dir: Path, api_key: str, force_full: bool, protected_terms: List[str]) -> None:
    langs = load_languages()
    cache = load_cache()

    en_path = locale_path(locales_dir, "en")
    if not en_path.exists():
        raise RuntimeError("第二阶段需要 en.json，但未找到。请先运行第一阶段生成 en.json。")

    en_obj = json.loads(en_path.read_text(encoding="utf-8"))

    excluded_lower = set([BASE.lower()] + [x.lower() for x in FIRST_HOP])

    for l in langs:
        code = l.code
        if code.lower() in excluded_lower:
            continue

        out_path = locale_path(locales_dir, code)
        existing = None
        if out_path.exists() and not force_full:
            existing = json.loads(out_path.read_text(encoding="utf-8"))

        # 英语地区码：直接复用 en（不走翻译）
        if code.lower().startswith("en-"):
            write_json_preserve_order(out_path, en_obj)
            print(f"🟦 复用 en：{out_path}", flush=True)
            continue

        # fallbacks：优先复用（省钱）
        reused = False
        for fb in (l.fallbacks or []):
            fb_path = locale_path(locales_dir, fb)
            if fb_path.exists():
                fb_obj = json.loads(fb_path.read_text(encoding="utf-8"))
                write_json_preserve_order(out_path, fb_obj)
                print(f"🟨 复用 fallback {fb}：{out_path}", flush=True)
                reused = True
                break
        if reused:
            continue

        translate_tree(
            base_obj=en_obj,
            base_code="en",
            src_lang_name="English",
            tgt_code=code,
            tgt_lang_name=f"{l.name} [{code}]",
            model=MODEL,
            api_key=api_key,
            existing_obj=existing,
            cache=cache,
            force_full=force_full,
            protected_terms=protected_terms,
            out_path=out_path,  # ✅ 边翻译边写
        )

        mode = "全量覆盖" if force_full else "增量追加"
        print(f"✅ 第二阶段{mode}：{out_path}", flush=True)

    save_cache(cache)
    print(f"💾 缓存已保存：{CACHE_FILE}", flush=True)


# =========================
# 清理：根据 key 删除翻译字段（不动 BASE）
# - 不排序，仅删除；保留原顺序
# =========================
def normalize_key_patterns(raw: str) -> List[Tuple[str, bool]]:
    parts = [x.strip() for x in raw.split(",") if x.strip()]
    out: List[Tuple[str, bool]] = []
    for p in parts:
        if p.endswith(".*"):
            out.append((p[:-2], True))
        elif p.endswith("."):
            out.append((p[:-1], True))
        elif p.endswith("*"):
            out.append((p[:-1], True))
        else:
            out.append((p, False))
    return out

def should_remove(path: str, patterns: List[Tuple[str, bool]]) -> bool:
    for pat, is_prefix in patterns:
        if is_prefix:
            if path == pat or path.startswith(pat + ".") or path.startswith(pat + "["):
                return True
        else:
            if path == pat:
                return True
    return False

def clean_translations_by_key(locales_dir: Path, key_patterns_raw: str) -> None:
    patterns = normalize_key_patterns(key_patterns_raw)
    if not patterns:
        print("未提供有效 key。", flush=True)
        return

    base_name = code_to_filename(BASE)
    files = [p for p in locales_dir.glob("*.json") if p.name != base_name]

    if not files:
        print("没有可清理的翻译文件（除 base 外）。", flush=True)
        return

    total_removed = 0
    for fp in files:
        obj = json.loads(fp.read_text(encoding="utf-8"))
        flat = flatten_json(obj)

        kept: List[Tuple[str, Any]] = []
        removed = 0
        for path, val in flat:
            if should_remove(path, patterns):
                removed += 1
                continue
            kept.append((path, val))

        if removed > 0:
            total_removed += removed
            new_obj = pairs_to_flat_dict(kept)  # 仍然写平铺 JSON
            write_json_preserve_order(fp, new_obj)
            print(f"🧽 {fp.name}: 删除 {removed} 项", flush=True)
        else:
            print(f"🧼 {fp.name}: 无匹配项，跳过", flush=True)

    print(f"✅ 清理完成：共删除 {total_removed} 项（不影响 {base_name}）", flush=True)


# =========================
# 排序：只有运行此选项才排序
# - 输出仍然是平铺 JSON（不分级）
# =========================
def sort_locale_file(path: Path) -> int:
    obj = json.loads(path.read_text(encoding="utf-8"))
    pairs = flatten_json(obj)
    before = [p for p, _ in pairs]
    pairs.sort(key=lambda x: path_sort_key(x[0]))
    after = [p for p, _ in pairs]
    changed = 1 if before != after else 0
    sorted_obj = pairs_to_flat_dict(pairs)
    write_json_preserve_order(path, sorted_obj)
    return changed

def sort_locales(locales_dir: Path, include_base: bool = False) -> None:
    base_name = code_to_filename(BASE)
    files = [p for p in locales_dir.glob("*.json") if include_base or p.name != base_name]
    if not files:
        print("没有可排序的 json 文件。", flush=True)
        return

    changed_count = 0
    for fp in files:
        changed_count += sort_locale_file(fp)
        print(f"🔧 已排序：{fp.name}", flush=True)
    print(f"✅ 排序完成：处理 {len(files)} 个文件，其中顺序发生变化的 {changed_count} 个", flush=True)


# =========================
# 菜单
# =========================
def menu() -> None:
    if not LANGS_FILE.exists():
        raise FileNotFoundError(f"找不到 {LANGS_FILE}（请确认路径正确）")

    locales_dir = pick_locales_dir()

    while True:
        protected_terms = load_protected_terms()

        print("\n========== i18n 工具 ==========", flush=True)
        print(f"LANGS_FILE : {LANGS_FILE}", flush=True)
        print(f"locales_dir: {locales_dir}", flush=True)
        print(f"BASE       : {BASE} ({code_to_filename(BASE)})", flush=True)
        print(f"MODEL      : {MODEL}", flush=True)
        print(f"WORKERS    : {MAX_WORKERS}  (env: I18N_WORKERS)", flush=True)
        print(f"PROTECTED  : {len(protected_terms)}  ({PROTECTED_TERMS_FILE} / env: I18N_PROTECTED_TERMS)", flush=True)
        print("--------------------------------", flush=True)
        print("1) 第一阶段（增量追加）：zh-hans → en / zh-hant / ja / ko", flush=True)
        print("2) 第一阶段（全量覆盖）：zh-hans → en / zh-hant / ja / ko", flush=True)
        print("3) 第二阶段（增量追加）：en → 其它语言（排除 en/zh-hant/ja/ko）", flush=True)
        print("4) 第二阶段（全量覆盖）：en → 其它语言（排除 en/zh-hant/ja/ko）", flush=True)
        print("5) 根据 key 清理翻译字段（不动 base，不排序）", flush=True)
        print("6) 排序翻译文件（仅此选项才排序）", flush=True)
        print("7) 退出", flush=True)

        choice = input("选择操作 (1/2/3/4/5/6/7): ").strip()

        if choice in {"1", "2", "3", "4"}:
            api_key = read_api_key()
            if not api_key:
                print("缺少 API Key，已取消。", flush=True)
                continue

        if choice == "1":
            build_first_hop(locales_dir, api_key=api_key, force_full=False, protected_terms=protected_terms)

        elif choice == "2":
            build_first_hop(locales_dir, api_key=api_key, force_full=True, protected_terms=protected_terms)

        elif choice == "3":
            build_second_hop_from_en(locales_dir, api_key=api_key, force_full=False, protected_terms=protected_terms)

        elif choice == "4":
            build_second_hop_from_en(locales_dir, api_key=api_key, force_full=True, protected_terms=protected_terms)

        elif choice == "5":
            raw = input("输入要清理的 key（逗号分隔；支持前缀 home.* 或 home. 或 home*）：\n> ").strip()
            clean_translations_by_key(locales_dir, raw)

        elif choice == "6":
            inc_base = input("是否也排序 base（zh-hans.json）？(y/N): ").strip().lower() == "y"
            sort_locales(locales_dir, include_base=inc_base)

        elif choice == "7":
            print("Bye.", flush=True)
            return

        else:
            print("无效选择。", flush=True)


if __name__ == "__main__":
    menu()
