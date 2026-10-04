# 高性价比人生指南网站

一个部署在 GitHub Pages 上的纯静态人生建议阅读网站。

## 在线地址

https://life.apiferry.cc

## 目录说明

- 仓库根目录：GitHub Pages 实际发布的 HTML、CSS、JavaScript 和图片。
- `source/`：React、TypeScript 和 Vite 源码，仅用于本地开发与构建。
- `CNAME`：自定义域名文件，请勿删除或改写。

## 本地开发

```powershell
cd source
npm install
npm run dev
```

## 构建

```powershell
cd source
npm run build
```

构建结果位于 `source/dist/`。正式发布前，需要将其中的静态文件同步到仓库根目录，并保留根目录的 `CNAME`。

## 本地数据

已做到、待做、收藏、最近阅读和主题设置仅使用浏览器 localStorage，数据不会上传到服务器。更换设备或清除浏览器数据后，这些记录会丢失。

## 内容来源

网站已收录 PDF 版本 `6f6d969` 的 34 个章节和 649 条建议，其中 20 条已整理完整说明，其余条目目前提供标题、摘要和证据等级。原著为 eternity4719 的开源项目《高性价比人生指南》，内容依据 CC BY 4.0 使用。

健康、法律、政策和金融相关信息可能发生变化，请核对最新原始来源。尚未逐条核对的内容会在网站中明确标注，不把 PDF 摘要扩写成未经验证的完整建议。
