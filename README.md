# 高性价比人生指南网站

一个部署在 GitHub Pages 上的纯静态人生建议阅读网站。

## 在线地址

https://life.apiferry.cc

## 目录说明

- 仓库根目录：GitHub Pages 实际发布的 HTML、CSS、JavaScript 和图片。
- `source/`：React、TypeScript 和 Vite 源码，仅用于本地开发与构建。
- `source/scripts/`：固定版本正文导入器、数据校验器和自动测试。
- `source/src/data/guide-full.json`：34 章、654 条完整静态正文。
- `source/src/data/glossary.json`：固定版本的 41 条术语解释。
- `CNAME`：自定义域名文件，请勿删除或改写。

## 本地开发

```powershell
cd source
npm install
npm run dev
```

打开终端显示的本地地址即可预览。网站没有后端，不需要数据库或常驻服务。

## 固定版本数据

网站内容固定于原项目提交：

```text
91a4f53c5ba3d3f524e5c72b4e32ab4c108015eb
```

重新生成数据前，先把该提交只读检出到 `tmp/upstream/howtolivebetter-6f6d969/`，再运行：

```powershell
cd source
npm run data:import
npm run data:check
npm run test:data
```

数据门禁会核对 34 章、654 条，证据等级 A/B/C 为 429/174/51，性价比极高/高/一般为 111/298/245，争议 65 条，待核实 3 条。

## 构建

```powershell
cd source
npm run build
```

构建结果位于 `source/dist/`。正式发布前，需要将其中的静态文件同步到仓库根目录，并保留根目录的 `CNAME`。

## 本地数据

已做到、待做、收藏、最近阅读和主题设置仅使用浏览器 localStorage，数据不会上传到服务器。更换设备或清除浏览器数据后，这些记录会丢失。

## 内容来源

网站完整收录固定版本 `91a4f53` 的 34 个章节和 654 条建议，包括成本、说人话、收益、证据等级、来源、备注、争议与待核实标记，并提供同版本官方 PDF。原著为 eternity4719 的开源项目《高性价比人生指南》，原始正文依据 CC BY 4.0 使用；本站页面结构、视觉样式和纯前端交互为改编内容。

健康、法律、政策和金融相关信息可能发生变化，请核对最新官方来源。固定版本中的 3 处待核实会继续明确显示，不把它们当成已确认事实。
