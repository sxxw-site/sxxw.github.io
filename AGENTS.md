# 公司官网 Harbor 工作副本开发配置

先读取 `/Users/dbb/Work/AGENTS.md` 的共同验收约束。

此目录与 `../sxxw.github.io/` 属于同一 Git 仓库的不同工作副本。以下命令均在本目录执行，保留当前分支和已有改动。

## 技能入口与业务契约

每次开发、修复或优化先读取当前工作副本的 [技能启用 SPEC](SKILLS_SPEC.md)，按本次任务自动读取其中命中的 `SKILL.md`，无需用户再次指定技能；只加载相关条目。

- React 18 + TypeScript + Vite + SSR 预渲染，技能示例不改变当前框架与工具链。
- 不套用 Next.js 专属实现。维护入口为 `src/`、`scripts/` 与配置；`docs/` 为主要生成输出，不以手改生成 HTML 代替源代码修复。
- 保持多语言正文、canonical/hreflang、robots、站点地图、JSON-LD 和真实翻译覆盖一致。Harbor 产品能力和截图须与当前原生应用的实际验证一致。
- 迁移 URL、站点外观、商店/支持入口和实际正文语言是兼容契约；未翻译的法律/支持正文保留正确 canonical 与索引策略。

## 验证入口

- 类型：`npm run typecheck`；影响页面/路由/预渲染时：`npm run build`；相关 SEO 改动：`npm run seo:check`。
- 修改 SEO 历史/策略实现时运行 `node --test scripts/seo-history.test.mjs`。此测试与 SEO 检查分工不同，不能互相替代。
- 浏览器检查用 `npm run dev -- --host 127.0.0.1` 或 `npm run preview -- --host 127.0.0.1`，按改动覆盖移动布局、语言跳转、RTL 和键盘交互。
- 构建将更新大量 `docs/` 文件；先核对已有改动，只交付本次相关产物。安装技能或修改开发规则不需要重建站点。
- `seo:submit` 涉及外部提交，仅在当前任务及已有授权范围执行。
