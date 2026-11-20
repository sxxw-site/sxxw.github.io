# 公司官网 Harbor 工作副本技能启用 SPEC

## 开发任务入口

每次对当前工作副本开发、修复或优化时，先读取 [AGENTS.md](AGENTS.md) 和本 SPEC，根据实际改动匹配下表，自动读取对应的 `/Users/dbb/.codex/skills/<技能名>/SKILL.md` 并遵循适用部分。用户无需重复指定技能；没有命中的条目不加载，技能正文及其参考资料按需读取。

技能文件已安装在本机，项目通过本 SPEC 接入，不复制技能正文。路径失效时先查找同名已安装技能，并明确未能启用的范围；本 SPEC 不自动安装新技能。此副本与 `../sxxw.github.io/` 的规范分别维护，源码、脚本和验证结果以当前副本为准。

## 技术栈与已有契约

技术依据为 [package.json](package.json)、[Vite 配置](vite.config.ts) 和 [预渲染脚本](scripts/prerender.mjs)：当前为 React 18.3、TypeScript 5.7、Vite 6，Node.js 要求 `>=20`，通过独立 SSR 构建生成静态 HTML。React 技能仅采用兼容当前架构的规则；不引入 Next.js 专属 API，不因技能示例升级 React、运行环境或路由系统。

维护入口为 `src/`、`scripts/` 与配置；`docs/` 是构建输出目录，技能规范留在本项目根目录，避免被构建覆盖或作为公开站点内容发布。保留现有设计系统、外观设置、跨语言路由、迁移 URL、商店/支持入口及产品事实；Harbor 能力和截图以原生应用的实际验证为依据，正文语言、canonical/hreflang、robots、站点地图和 JSON-LD 必须一致。

## 按任务自动选择

| 任务触发 | 读取技能 | 本项目应用范围 |
| --- | --- | --- |
| 官网、Harbor 产品页、支持页、组件的设计与视觉调整 | [design-taste-frontend](/Users/dbb/.codex/skills/design-taste-frontend/SKILL.md) | 作为网页视觉与布局主技能，沿用现有组件与设计 token；素材和能力声明以真实产品为依据。 |
| React 组件、状态、渲染或包体性能优化 | [vercel-react-best-practices](/Users/dbb/.codex/skills/vercel-react-best-practices/SKILL.md) | 使用适用于 React 18 和 Vite SSR 的规则；先检查实际瓶颈，不套用 Next.js 路由、服务端缓存或框架设施。 |
| 键盘交互、焦点、可访问性或 RTL/长文本布局专项优化 | [ui-ux-pro-max](/Users/dbb/.codex/skills/ui-ux-pro-max/SKILL.md) | 补充交互与可访问性依据；延续现有视觉系统，不替换网页设计主技能。 |
| 网站搜索发现、索引、canonical/hreflang、robots、站点地图或结构化数据 | [seo-audit](/Users/dbb/.codex/skills/seo-audit/SKILL.md) | 核对源内容、预渲染输出与实际呈现，区分观测事实、推断与待验证假设；网站 SEO 与 App Store ASO 分开处理。 |
| 操作网页、检查当前布局与浏览器交互 | [playwright-cli](/Users/dbb/.codex/skills/playwright-cli/SKILL.md) | 已有浏览器或电脑控制连接能完成时优先使用；检查受影响入口、移动宽度、语言跳转和键盘交互。 |
| 编写、维护或排查 Playwright 交互、视觉、可访问性或多语言回归 | [playwright-best-practices](/Users/dbb/.codex/skills/playwright-best-practices/SKILL.md) | 结合项目现有测试基础设施，仅增加保护本次行为的必要覆盖；一次页面检查不要求新增整套测试设施。 |
| 准备声称完成、修复、测试通过或提交变更 | [verification-before-completion](/Users/dbb/.codex/skills/verification-before-completion/SKILL.md) | 运行与本次范围匹配的验证，读取本次输出后报告；未运行、受阻与通过分开表述。 |

## 验收与操作边界

- 类型检查用 `npm run typecheck`；影响页面、路由或预渲染时执行 `npm run build`；相关 SEO 改动执行 `npm run seo:check`。SEO 历史或策略实现变化还运行 `node --test scripts/seo-history.test.mjs`，测试与 SEO 输出检查不能互相替代。
- 页面变化还需实际浏览器布局和交互检查；SEO 变化核对本次预渲染输出、正文语言和索引策略。构建更新大量 `docs/` 产物，保留已有改动，只交付本次相关产物，不使用另一副本的检查结果替代本副本验收。
- 仅修改本 SPEC 或 AGENTS 时检查引用、技能路径和规则一致性，不重建站点。网站检查不能证明 Harbor 原生播放、媒体或设备能力已验证。
- `seo:submit`、线上发布及外部后台修改按当前任务和既有授权执行；接入或读取技能本身不自动提交搜索引擎、不切换托管平台，也不改动其他工作副本。
