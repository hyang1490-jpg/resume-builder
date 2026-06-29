# resume-builder

一个零构建的在线简历编辑器：左侧填表单，右侧 A4 实时预览，浏览器原生 `window.print()` 导出 PDF。

- **前端**：单页 React，通过 CDN 引入 + 浏览器内 Babel 编译 `src/app.jsx`，**无需 npm / 打包**，直接用静态服务器打开即可。
- **后端**：极简 FastAPI（`main.py`），目前为**模板化占位**（见下方说明）。
- **样式**：`css/index.css`。
- **数据持久化**：表单内容自动存入浏览器 `localStorage`，刷新不丢；支持 JSON 导入 / 导出 / 重置。

> ⚠️ 关于「AI 分析」：当前后端 `/api/analyze` 返回的是**固定模板文案，并不对简历做任何真实分析**。这是占位实现，留待路线图 Phase B（B5）改造为真实的简历完整性检查器。请勿误以为它在做 AI 分析。

---

## 目录结构（概览）

```
.
├── index.html         # 入口，加载 React/Babel 与 src/app.jsx
├── src/
│   └── app.jsx        # 应用主体（表单 + 实时预览 + 导入导出）
├── css/
│   └── index.css      # 全部样式（含 @media print 打印规则）
├── main.py            # FastAPI 后端（占位）
├── requirements.txt
├── tests/
│   └── smoke.mjs      # Playwright 前端冒烟测试（见下方）
├── ROADMAP.md         # 项目进度与后续计划
└── README.md
```

## 运行方式

需要两个进程：一个静态服务器伺服前端，一个 uvicorn 跑后端。**注意两者端口不要撞**（`http.server` 与 `uvicorn` 默认都是 8000）。

**1) 前端（静态服务，默认 8000）**

```bash
python -m http.server 8000
# 浏览器打开 http://localhost:8000
```

**2) 后端（FastAPI，建议放 8001 避免与前端撞端口）**

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## 前后端联通：`window.API_BASE`

前端默认按内置的 `API_BASE`（`http://localhost:8000`）去请求后端。本地若把后端放在 8001，在打开页面后于浏览器控制台执行，或在 `index.html` 中于加载 `app.jsx` 之前注入：

```html
<script>
  window.API_BASE = "http://localhost:8001";
</script>
```

未设置时使用源码内置的默认值。把它做成可覆盖，是为了同一份前端能指向本地 / 局域网 / 部署后的不同后端地址。

## 数据与隐私

- 简历内容仅保存在**你本机浏览器**的 `localStorage`，不上传。
- 「导出 JSON」可把当前内容下载为文件备份，「导入 JSON」可恢复，「重置」清空。
- 后端 CORS 允许源可通过环境变量 `ALLOWED_ORIGINS`（逗号分隔，默认 `*`）配置。简历会涉及个人信息（PII），**部署上线前建议把 `ALLOWED_ORIGINS` 从默认的 `*` 收紧到你的实际前端域名**。

## 导出 PDF

在预览区直接用浏览器打印（`Ctrl/Cmd + P`）保存为 PDF；打印样式由 `css/index.css` 中的 `@media print` 控制，已对长简历做多页分页处理（条目不会被从中间裂开），并自动隐藏编辑控件。

## 前端冒烟测试

`tests/smoke.mjs` 用 Playwright 驱动 Chromium，校验渲染、localStorage 持久化与刷新恢复、条目上下排序、导入导出控件等核心行为，用于挡住回归。运行：

```bash
# 需本机有 node 与 playwright（及一个 Chromium）
node tests/smoke.mjs
```

脚本顶部注释说明了在受限网络下如何用本地托管的 React/Babel/Lucide 替代 CDN 来跑测试。
