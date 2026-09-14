# 树下小屋 · 统一公告平台（Announcements）

全 App 共用的「App 内通知/公告」数据源。**纯静态、零成本**：数据是一个 JSON 文件，
托管在本站（GitHub Pages / sxxw.site），App 端启动时拉取并本地过滤渲染。

## 端点

```
生产：https://sxxw.site/api/announcements/v1/feed.json
文件：public/api/announcements/v1/feed.json   （构建时自动拷贝到 docs/，随 Pages 部署）
```

## 发布流程

1. 编辑 `public/api/announcements/v1/feed.json`（新增/修改一条 `items`）。
2. 提交并推送 `main` → GitHub Actions 自动构建部署。
3. 几分钟后 App 端下次拉取即可见。回滚 = `git revert`。

> 每次改动请顺手更新顶层的 `updatedAt`（ISO 8601 UTC）。

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✅ | 全局唯一。App 用它记「已读 / 不再提示」，**发布后不要改** |
| `type` | string | ✅ | `notice`｜`update`｜`maintenance`｜`activity`，端侧可据此配图标/配色 |
| `priority` | number | ✅ | 数值越大越靠前 |
| `pinned` | bool | | 置顶常驻（忽略已读折叠） |
| `dismissible` | bool | | 是否允许用户「不再提示」（按 `id` 记录） |
| `apps` | string[] | | 目标 App：`memoria`｜`timetrails`｜`traceapp`。空/省略 = 所有 App |
| `platforms` | string[] | | `ios`｜`harmony`。空/省略 = 所有平台 |
| `minVersion` / `maxVersion` | string｜null | | 语义化版本区间定向，端侧做闭区间比较；null = 不限 |
| `startAt` / `endAt` | string｜null | | 生效窗口（ISO 8601 UTC）。当前时间不在窗口内则不展示；`endAt=null` = 长期 |
| `title` / `body` | `{lang: text}` | ✅ | 多语言映射，键用站点语言码（`zh-Hans`/`zh-Hant`/`en`/…） |
| `action` | object｜null | | 可选行动按钮：`{ label:{lang:text}, url }` |

### 多语言取值规则（端侧）
按当前语言 `L`：`title[L]` → 同基础语言（如 `zh-Hant` 回退 `zh-Hans`，`pt-BR`→`pt`）→ `en` → 映射里第一个可用值。
只需内置这三种即可覆盖大多数场景，其余语言按需补。

## 端侧行为约定（三端统一）

1. 启动时（或每 6–12h）拉取 `feed.json`，带 `ETag` / `If-None-Match` 省流量。
2. 本地过滤：`apps` → `platforms` → `min/maxVersion` → `startAt/endAt` 时间窗。
3. 按 `priority` 降序展示；`pinned` 置顶；未读红点。
4. `dismissible` 的把 `id` 记入本地「不再提示」集合。
5. **拉取失败用本地缓存兜底，绝不阻塞启动。**

## 端侧模型契约（复制到各 App 仓库）

### Swift（iOS / Memoria·TimeTrails·TraceApp）

```swift
struct AnnouncementFeed: Codable { let version: Int; let updatedAt: String; let items: [Announcement] }

struct Announcement: Codable, Identifiable {
    let id: String
    let type: String
    let priority: Int
    let pinned: Bool?
    let dismissible: Bool?
    let apps: [String]?
    let platforms: [String]?
    let minVersion: String?
    let maxVersion: String?
    let startAt: String?
    let endAt: String?
    let title: [String: String]
    let body: [String: String]
    let action: Action?
    struct Action: Codable { let label: [String: String]; let url: String }
}

// 取本地化文案：exact → 基础语言 → en → 任意
func localized(_ m: [String: String], lang: String) -> String {
    if let v = m[lang] { return v }
    let base = String(lang.prefix(while: { $0 != "-" }))
    if let hit = m.first(where: { $0.key.lowercased().hasPrefix(base.lowercased()) }) { return hit.value }
    return m["en"] ?? m.values.first ?? ""
}
```

### ArkTS（HarmonyOS / 拾忆鸿蒙版）

```typescript
export interface Announcement {
  id: string; type: string; priority: number;
  pinned?: boolean; dismissible?: boolean;
  apps?: string[]; platforms?: string[];
  minVersion?: string | null; maxVersion?: string | null;
  startAt?: string | null; endAt?: string | null;
  title: Record<string, string>;
  body: Record<string, string>;
  action?: { label: Record<string, string>; url: string } | null;
}
export interface AnnouncementFeed { version: number; updatedAt: string; items: Announcement[] }
```

## 升级路径（暂不需要）

当需要「定点推送 / 已读率统计 / 后台可视化编辑 / A/B」时，用轻量服务器（Go）实现**同一套 schema**
+ 一个小后台，App 只改 baseURL，数据结构不变。在此之前静态方案足够，且零成本。
