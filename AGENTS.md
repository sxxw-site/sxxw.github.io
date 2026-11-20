# 公司官网 SEO 工作副本开发配置

先读取 `/Users/dbb/Work/AGENTS.md` 的共同验收约束和 `../AGENTS.md` 的网站路由。

此目录是公司官网的独立 Git worktree。每次开发、修复或优化先读取本副本的 [技能启用 SPEC](SKILLS_SPEC.md)，按任务自动读取其中命中的 `SKILL.md`，无需用户重复指定。保留当前分支与已有改动，不用其他副本的源码或验证结果替代本副本。

## 技术与业务契约

- React 18 + TypeScript + Vite + SSR 预渲染，Node.js 最低版本按 `package.json` 的 `>=20`；技能示例不引入 Next.js API 或升级工具链。
- 维护入口为 `src/`、`scripts/` 和配置，`docs/` 为构建输出。内容、路由和 SEO 修复写在源文件，不以手改生成 HTML 代替长期修复。
- 保留多语言正文、canonical/hreflang、robots、站点地图、JSON-LD 与实际翻译范围的一致性；产品能力、素材、隐私与支持文案使用真实产品依据。
- 历史 TimeTrails 页面使用已有冻结清单与固定本地目标；保留语言回退、原始 query/hash 和导入指南锚点规则，不把历史产品页、指南和法律页合并为通用重定向。

## 验证入口（从本副本执行）

- 类型检查：`npm run typecheck`；影响页面、路由或预渲染时：`npm run build`，构建会更新 `docs/`，先核对已有改动。
- SEO 改动：`npm run seo:check`。当前脚本先执行 `scripts/legacy-timetrails.test.mjs` 和 `scripts/legacy-timetrails-guides.test.mjs`，再检查预渲染输出；SEO 历史/策略实现变化另运行 `node --test scripts/seo-history.test.mjs`。
- 页面与重定向变化检查真实浏览器布局、语言跳转、键盘交互和受影响的 query/hash，不用类型检查代替行为验收。
- 仅修改技能规范时检查文档引用与技能路径，不重建站点。`seo:submit` 和线上发布遵循当前任务及既有授权，不随读取技能自动执行。
