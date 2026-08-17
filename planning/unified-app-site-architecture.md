# sxxw.site 应用支持站：需求与架构基线

> 状态：设计已确认前，不迁移内容、不下线现有 GitHub Pages。  
> 目标站点：`https://sxxw.site`  
> 产品：Memoria · 拾忆、TimeTrails · 时光轨迹、TraceApp。

## 1. 目标与边界

将 `sxxw.site` 从公司介绍页升级为三个应用的统一官网与用户支持入口。每个应用都应具备：

- 产品介绍：解决什么问题、核心能力、支持平台、下载入口；
- 新手引导：从安装、授权到首次完成关键任务；
- 隐私政策和用户协议：可直接被商店审核、用户和搜索引擎访问；
- 技术支持：常见问题、权限排查、联系入口；
- 可被搜索引擎和 AI 回答系统准确理解的结构化信息。

本次按“新版本”处理：不再为旧的 `memoria.sxxw.site`、`timetrails.sxxw.site`、`sxxw-site.github.io/sxxw-hub` 保留页面或 URL 兼容。下线指取消其 GitHub Pages 发布，仓库源代码保留，作为事实与历史资料来源。

## 2. 已确认的产品事实

| 产品 | 展示名称 | 当前平台 | 数据与隐私定位 | 特殊要求 |
| --- | --- | --- | --- | --- |
| Memoria | Memoria · 拾忆；华为商店展示为“拾忆” | iOS / App Store；HarmonyOS / 华为应用市场 | 无账号、无广告、无第三方追踪；iOS 可使用用户私有 iCloud；HarmonyOS 为本地、无云同步版本 | 介绍、引导、隐私政策与用户协议必须按 iOS / HarmonyOS 分开 |
| TimeTrails | TimeTrails · 时光轨迹 | 以 iOS 为当前公开平台 | 轨迹记录与可视化；默认本地存储；可选 iCloud 私有备份 | 明确定位、后台定位、运动与耗电等使用场景及权限说明 |
| TraceApp | TraceApp | iOS | 本地旅行轨迹记录、距离/配速、轨迹回放；无广告或第三方分析 SDK | 明确定位、运动权限与本地数据删除方式 |

除法律文本中各平台的正式应用名称外，文案不混用产品名称：Memoria 的 iOS 文案使用“Memoria · 拾忆”，HarmonyOS 文案使用审核要求的“拾忆”，并在首次出现处说明其与 Memoria 的对应关系。

## 3. 信息架构与公开路由

页面必须是可直接访问的静态 HTML，而不是仅依赖客户端跳转；这样商店审核、分享、搜索引擎和 AI 抓取器都能稳定读取。

```text
/
├── /apps
│   ├── /apps/memoria
│   │   ├── /apps/memoria/ios
│   │   ├── /apps/memoria/harmony
│   │   ├── /apps/memoria/ios/getting-started
│   │   ├── /apps/memoria/harmony/getting-started
│   │   ├── /apps/memoria/ios/privacy
│   │   ├── /apps/memoria/harmony/privacy
│   │   ├── /apps/memoria/ios/terms
│   │   ├── /apps/memoria/harmony/terms
│   │   └── /apps/memoria/support
│   ├── /apps/timetrails
│   │   ├── /apps/timetrails/getting-started
│   │   ├── /apps/timetrails/privacy
│   │   ├── /apps/timetrails/terms
│   │   └── /apps/timetrails/support
│   └── /apps/traceapp
│       ├── /apps/traceapp/getting-started
│       ├── /apps/traceapp/privacy
│       ├── /apps/traceapp/terms
│       └── /apps/traceapp/support
├── /about
├── /contact
├── /sitemap.xml
├── /robots.txt
└── /llms.txt
```

`/apps/memoria` 是平台选择页。页面内可用标签快速切换 iOS / HarmonyOS，但每个标签都必须有上表对应的独立 canonical URL，不能仅用 `?platform=` 作为法律页或商店审核入口。

## 4. React 与内容架构

### 4.1 渲染方式

继续使用 Vite + React + TypeScript。构建阶段增加静态预渲染：为上述每个路由写出独立的 `index.html`，客户端 React 仅用于导航、平台选择、折叠 FAQ 和语言切换。

原因：GitHub Pages 不提供可靠的 SPA 路由回退；而独立 HTML 同时满足 SEO、商店审核深链、社交分享和无 JavaScript 可读性。

### 4.2 代码分层

```text
src/
├── app/                 # 路由定义、页面壳、SEO 生成器
├── components/          # Header、Footer、平台切换、FAQ、法律目录、下载卡片
├── content/
│   ├── apps/            # 每个产品的结构化事实、平台差异、引导步骤、FAQ
│   └── legal/           # 审核可用的版本化政策与协议正文
├── i18n/                # 语言选择、词典加载、fallback
├── pages/               # 首页、应用页、Guide、Legal、Support 页面组合
├── styles/              # 设计 token 与组件样式
└── prerender/           # 路由清单、静态 HTML、sitemap/robots/llms.txt 生成
```

### 4.3 JSON 内容模型

所有可编辑文案使用 JSON；页面组件不硬编码产品事实或法律正文。

```json
{
  "app": "memoria",
  "platform": "harmony",
  "displayName": "拾忆",
  "aliases": ["Memoria · 拾忆"],
  "store": {
    "name": "华为应用市场",
    "url": "https://developer.huawei.com/consumer/cn/service/josp/agc/index.html#/myApp/6917613545100329502/9322385623857555199"
  },
  "capabilities": ["local-events", "notifications"],
  "dataPolicy": {
    "account": false,
    "network": false,
    "cloudSync": false,
    "thirdPartyTracking": false
  }
}
```

法律 JSON 需要独立字段：`documentType`、`version`、`effectiveDate`、`platform`、`storeDisplayName`、`sections`、`contact`。发布时在页面醒目显示生效日期和适用平台，避免一个平台误用另一个平台的政策。

### 4.4 多语言策略

- 以简体中文为法律与产品事实的权威源；
- 每个语言均有独立 JSON，并回退至简体中文；
- 仅将已经完整校对的语言展示给用户；
- 法律页面默认使用中文，并预留英文便利译文；任意翻译不得覆盖中文正式文本；
- URL 先以中文权威页面为 canonical，后续可增加 `/en/...` 静态页面与 `hreflang`。

## 5. 每款 App 的内容模板

每个产品采用同一骨架，确保用户不需要重新学习网站结构：

1. **介绍页**：一句话定位、支持平台、核心场景、隐私承诺、下载/跳转商店；
2. **新手引导**：准备事项、权限说明、首次 3–5 步、常见失败处理、下一步链接；
3. **隐私政策**：适用平台、处理的数据、权限、存储/同步、第三方、删除与权利、更新和联系；
4. **用户协议**：服务范围、许可、用户责任、免责声明、变更、联系；
5. **支持页**：FAQ、权限/同步/耗电等故障排查、反馈通道。

Memoria 的 iOS 与 HarmonyOS 页面只共用通用纪念日功能；所有涉及应用名称、通知跳转、同步、iCloud、网络、数据保留和商店信息的段落均使用平台专属内容。

## 6. SEO 与 GEO（Generative Engine Optimization）

### 6.1 技术 SEO

- 每页独立 `<title>`、`meta description`、canonical、Open Graph 与 Twitter Card；
- 每页具有唯一 H1，且按 H2/H3 构成可读的章节层级；
- 生成 `sitemap.xml`、`robots.txt`，并只收录公开、可索引页面；
- 生成 `hreflang`（语言页面上线后启用）和面包屑；
- 生成 `SoftwareApplication`、`Organization`、`WebSite`、`BreadcrumbList`、`FAQPage` JSON-LD；
- 商店链接使用明确的应用名与平台名，图片提供真实替代文本、尺寸与性能优化；
- 不使用伪关键词堆砌，不将隐私承诺写成无法证实的绝对化营销语。

### 6.2 GEO

- 每个 App 页首段用简洁、可独立引用的事实描述“是什么、适用谁、在哪个平台、数据在哪里”；
- FAQ 使用问答式、可被引用的短答案，且每项能链接至对应引导或政策章节；
- 提供站点级 `llms.txt`，列出产品、权威 URL、平台差异、政策与支持入口；
- 结构化数据和正文保持同一事实源，避免 AI 摘要与法律页发生矛盾；
- 公司实体仅公开“上海”与官方联系邮箱；无精确实体地址时不伪造 LocalBusiness 地址或地图数据。

## 7. 发布与迁移策略

1. 在主站完成所有路由的静态构建和线上验收；
2. 先将商店中的政策/支持 URL 更新为主站新 URL；
3. 检查至少 7 天访问日志、商店审核引用与外部链接；
4. 取消下列 Pages 发布：
   - `memoria-org/memoria-org.github.io`（`memoria.sxxw.site`）；
   - `timetrails-org/timetrails-org.github.io`（`timetrails.sxxw.site`）；
   - `sxxw-site/sxxw-hub`（`sxxw-site.github.io/sxxw-hub`）；
5. 主站 Pages 保持由 GitHub Actions 工作流自动构建、部署；
6. 删除旧域名 DNS 前，再确认不再被商店后台、应用内链接或官方资料引用。

“下线 Pages”不等同于删除仓库；仓库只在确认无需保存源码后另行处理。

## 8. 实施任务与验收

| 编号 | 任务 | 产物 | 验收标准 |
| --- | --- | --- | --- |
| T0 | 本架构与事实核对 | 本文档、三款 App 事实清单 | 产品名称、平台、商店、隐私事实均有来源且无冲突 |
| T1 | 建立统一站点骨架与静态预渲染 | 路由、布局、内容加载、构建脚本 | 任一公开 URL 直接打开均得到对应 HTML；现有首页视觉不退化 |
| T2 | 实现 Memoria | iOS/Harmony 介绍、引导、隐私、协议、支持 | 两个平台有独立 URL；名称、iCloud/网络和政策完全一致 |
| T3 | 实现 TimeTrails | 介绍、引导、隐私、协议、支持 | 定位权限、后台行为、数据存储和可选 iCloud 描述一致 |
| T4 | 实现 TraceApp | 介绍、引导、隐私、协议、支持 | 仅声明已实现的 iOS 本地能力与权限，不复制其他 App 文案 |
| T5 | SEO/GEO | 元信息、JSON-LD、sitemap、robots、llms.txt | Rich Result 校验无结构错误；所有 canonical 与 URL 一致 |
| T6 | 迁移与下线 | 商店链接检查表、Pages 取消发布记录 | 主站线上内容已验证后，三个旧 Pages 均取消发布 |
| T7 | 回归与发布 | 自动化构建、链接/可访问性检查、GitHub Action 记录 | `typecheck`、构建、关键链接与线上页面验证通过 |

实施顺序固定为 **T1 → T2（Memoria）→ T3（TimeTrails）→ T4（TraceApp）→ T5 → T6 → T7**。每完成一个 App，都先完成其自身验证和提交，再开始下一个 App。

## 9. 当前决策与待核对项

- 已决策：统一入口为 `sxxw.site`；旧 Pages 不做 URL 兼容；Memoria 必须按 iOS/Harmony 分流。
- 待核对：三个应用的正式商店链接、TraceApp 的正式中文展示名与支持邮箱、每份用户协议的生效日期与版本号。
- 待核对：在取消旧 Pages 前，是否需要商店后台 URL 更新窗口或最短保留期。

任何待核对项未确认前，相关法律页不发布为“最终版本”。
