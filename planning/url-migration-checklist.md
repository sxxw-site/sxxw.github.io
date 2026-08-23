# sxxw.site 网址统一清单

> 目标:iOS + 鸿蒙(华为)两端,各 app 的隐私/支持/官网网址全部统一到 `https://sxxw.site/apps/<app>/…`。
> 下表所有 URL 均已验证返回 200。

## ✅ A. 已在仓库改好(无需后台手填,发版/上传即生效)

| 位置 | 内容 | 生效方式 |
|---|---|---|
| Memoria `store/metadata/`(iOS,全语言) | privacy→`/apps/memoria/ios/privacy`、support→`/apps/memoria/support`、marketing→`/apps/memoria` | 下次 `fastlane deliver` |
| TimeTrails `store/metadata/`(iOS,全语言) | privacy→`/apps/timetrails/privacy`、support→`/apps/timetrails/support`、marketing→`/apps/timetrails` | 下次 `fastlane deliver` |
| Memoria `harmonyStore/`(华为元数据+legal) | privacy→`/apps/memoria/harmony/privacy`、support→`/apps/memoria/support`、marketing→`/apps/memoria` | 上传华为商店时使用 |
| TimeTrails 应用内 H5(`H5Route.swift`/关于页) | 隐私/支持/关于/引导→`/apps/timetrails/*` | **需重新编译发版** |
| TraceApp 内置 `help.html`/`private_note.html` | 隐私/支持/官网→`/apps/traceapp/*` | **需重新编译发版** |

> ⚠️ 提交注意:Memoria 仓库里另有一批已封板的 `harmonyOS/**` 功能改动(与网址无关),按需一起提交即可。

## ☐ B. 需要你去各后台手动填写 / 核对

### App Store Connect(iOS)
| App | 字段 | 应填 | ☐ |
|---|---|---|---|
| TraceApp | 隐私政策网址 | `https://sxxw.site/apps/traceapp/privacy` | ☐ |
| TraceApp | 支持网址 | `https://sxxw.site/apps/traceapp/support` | ☐ |
| TraceApp | 营销网址(选填) | `https://sxxw.site/apps/traceapp` | ☐ |
| Memoria | App 隐私 → 隐私政策网址 | `https://sxxw.site/apps/memoria/ios/privacy` | ☐ |
| TimeTrails | App 隐私 → 隐私政策网址 | `https://sxxw.site/apps/timetrails/privacy` | ☐ |

> ASC 的「App 隐私」里那条隐私政策 URL 通常要在后台单独确认;Memoria/TimeTrails 的三条元数据虽走 fastlane,建议上传后在 ASC 再核一眼。

### 华为 AGC / AppGallery Connect(鸿蒙)
| App | 字段 | 应填 | ☐ |
|---|---|---|---|
| Memoria | 隐私政策网址 | `https://sxxw.site/apps/memoria/harmony/privacy` | ☐ |
| Memoria | 客服/支持网址 | `https://sxxw.site/apps/memoria/support` | ☐ |
| TimeTrails | 隐私政策网址 | `https://sxxw.site/apps/timetrails/privacy` | ☐ |
| TimeTrails | 客服/支持网址 | `https://sxxw.site/apps/timetrails/support` | ☐ |

> TimeTrails 鸿蒙仓库内没有商店元数据文件,隐私/支持网址只能在 AGC 后台填。

### 微信开放平台
| App | 字段 | 处理 | ☐ |
|---|---|---|---|
| TraceApp | universalLink | **维持原样** `https://flywithbug.github.io/traceApp_about/`(按你要求不动) | ☐ |

## 📋 C. 全 URL 速查(均 200)

**Memoria**
- 官网 `https://sxxw.site/apps/memoria`
- 支持 `https://sxxw.site/apps/memoria/support`
- iOS 隐私 `https://sxxw.site/apps/memoria/ios/privacy` · iOS 协议 `https://sxxw.site/apps/memoria/ios/terms`
- 鸿蒙 隐私 `https://sxxw.site/apps/memoria/harmony/privacy` · 鸿蒙 协议 `https://sxxw.site/apps/memoria/harmony/terms`

**TimeTrails**
- 官网 `https://sxxw.site/apps/timetrails` · 支持 `https://sxxw.site/apps/timetrails/support`
- 隐私 `https://sxxw.site/apps/timetrails/privacy` · 协议 `https://sxxw.site/apps/timetrails/terms`

**TraceApp**
- 官网 `https://sxxw.site/apps/traceapp` · 支持 `https://sxxw.site/apps/traceapp/support`
- 隐私 `https://sxxw.site/apps/traceapp/privacy` · 协议 `https://sxxw.site/apps/traceapp/terms`
