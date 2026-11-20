# 公司官网 SEO 工作副本技能启用 SPEC

## 开发任务入口

每次对当前工作副本开发、修复或优化时，先读取 [AGENTS.md](AGENTS.md) 和本 SPEC，根据实际改动匹配下表，自动读取对应的 `/Users/dbb/.codex/skills/<技能名>/SKILL.md` 并遵循适用部分。用户无需重复指定技能；没有命中的条目不加载，技能正文及其参考资料按需读取。

技能文件已安装在本机，项目通过本 SPEC 接入，不复制技能正文。路径失效时先查找同名已安装技能，并明确未能启用的范围；本 SPEC 不自动安装新技能。源码、脚本与验证结果以当前 worktree 为准，不加载其他官网副本的 SPEC 来替代本文件。

## 技术栈与已有契约

技术依据为 [package.json](package.json)、[Vite 配置](vite.config.ts)、[预渲染脚本](scripts/prerender.mjs) 和历史 [产品页迁移](scripts/legacy-timetrails.mjs) / [导入指南迁移](scripts/legacy-timetrails-guides.mjs)：当前为 React 18.3、TypeScript 5.7、Vite 6，Node.js 要求 `>=20`，通过独立 SSR 构建生成静态 HTML。采用兼容当前架构的 React 规则，不套用 Next.js API，不因技能示例升级工具链。

维护入口为 `src/`、`scripts/` 与配置；`docs/` 是构建输出，技能规范留在项目根目录。保留现有组件与设计 token、跨语言路由、产品事实和实际翻译范围。历史链接的冻结清单、固定本地目标、语言回退、query/hash 和导入指南锚点是本副本受影响时需验证的兼容契约。

## 按任务自动选择

| 任务触发 | 读取技能 | 本项目应用范围 |
| --- | --- | --- |
| 官网、产品介绍、支持页、组件的设计与视觉调整 | [design-taste-frontend](/Users/dbb/.codex/skills/design-taste-frontend/SKILL.md) | 作为网页视觉与布局主技能，沿用现有组件与设计 token，保留真实产品内容和迁移入口。 |
| React 组件、状态、渲染或包体性能优化 | [vercel-react-best-practices](/Users/dbb/.codex/skills/vercel-react-best-practices/SKILL.md) | 使用适用于 React 18 和 Vite SSR 的规则；先检查实际瓶颈，不套用 Next.js 路由或缓存设施。 |
| 键盘交互、焦点、可访问性或 RTL/长文本布局专项优化 | [ui-ux-pro-max](/Users/dbb/.codex/skills/ui-ux-pro-max/SKILL.md) | 补充交互与可访问性依据，延续现有视觉系统。 |
| 索引、历史 URL 迁移、canonical/hreflang、robots、站点地图或结构化数据 | [seo-audit](/Users/dbb/.codex/skills/seo-audit/SKILL.md) | 核对源内容、迁移语义、预渲染输出与实际呈现，区分事实、推断与待验证假设；网站 SEO 与 App Store ASO 分开。 |
| 操作网页、检查当前布局、语言切换或重定向行为 | [playwright-cli](/Users/dbb/.codex/skills/playwright-cli/SKILL.md) | 已有浏览器或电脑控制连接能完成时优先使用；迁移检查覆盖固定目标、语言回退和 query/hash，不自动访问无关外部后台。 |
| 编写、维护或排查 Playwright 交互、视觉、可访问性或多语言回归 | [playwright-best-practices](/Users/dbb/.codex/skills/playwright-best-practices/SKILL.md) | 仅在需要浏览器测试时启用；保留现有 Node.js 行为测试，不为迁移纯函数测试引入 Playwright。 |
| 准备声称完成、修复、测试通过或提交变更 | [verification-before-completion](/Users/dbb/.codex/skills/verification-before-completion/SKILL.md) | 运行与本次范围匹配的验证，读取本次输出后报告；未运行、受阻与通过分开表述。 |

## 验收与操作边界

- 类型检查用 `npm run typecheck`；页面、路由或预渲染变化执行 `npm run build`。构建更新 `docs/`，只交付本次相关产物，保留已有改动。
- SEO 变化执行 `npm run seo:check`：当前脚本先运行历史产品页和导入指南迁移的两套 Node.js 测试，再运行 `scripts/check-seo.mjs` 检查输出。SEO 历史/策略实现变化另运行 `node --test scripts/seo-history.test.mjs`；这些检查与实际浏览器行为验证分别负责不同范围。
- 仅修改本 SPEC 或 AGENTS 时检查引用、技能路径和规则一致性，不构建站点。网页检查不能证明原生应用能力通过，其他副本的历史结果不能证明本副本通过。
- `seo:submit`、线上发布与外部后台修改遵循当前任务及既有授权；接入技能本身不自动提交搜索引擎，不切换托管平台，也不改动其他工作副本。
