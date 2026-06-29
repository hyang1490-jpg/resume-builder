# resume-builder — 项目进度与路线图

> 应用形态：单页 React（CDN + 浏览器内 Babel，**无构建**）+ 极简 FastAPI 后端（`main.py`）+ `css/index.css`。左侧表单、右侧 A4 实时预览，`window.print()` 导出 PDF。

## 进度（已并入 PR #1，分支 `claude/harms-engineering-codex-mocumw`）

| 提交 | 内容 |
|------|------|
| `85e0876` | 高优先级 3 修：教育日期 `split('-')` 损坏、硬编码 ngrok→可配置 `API_BASE`、CORS 通配源+credentials 非法组合 |
| `130dd2d` | 中低 5 修：打印 `.paper`→`.resume-paper`、移除未用 html2pdf/printRef、`useEffect` 加依赖、技能 `key`、删空文件 `src/Airsence` |
| `886d21c` | P0 四件套：localStorage 自动保存/恢复、JSON 导入导出+重置、默认数据改空白占位+placeholder、表单可访问性 |
| _本批_ | Phase A 打磨（见下，A0–A7） |

## Phase A — 无构建打磨（本批完成）

刻意保持「零安装、直接开 html」，不引入 Vite / 打包。

| 项 | 内容 | 状态 |
|----|------|------|
| A0 | 项目文档：`README.md`（运行方式/隐私/测试）、本 `ROADMAP.md` | ✅ |
| A1 | 仓库卫生：`.gitignore`、`requirements.txt`、停止跟踪已提交的 `__pycache__/*.pyc` | ✅ |
| A2 | 后端：CORS 允许源改读环境变量 `ALLOWED_ORIGINS`、新增 `/health`、端点注释标注「模板化占位」；前端 `handleAnalyze` 增加 `response.ok` 检查 | ✅ |
| A3 | 打印整合：删除散落 3 处的打印规则，合并为 `css/index.css` 内单一权威 `@media print`；新增 `break-inside: avoid` 分页控制，允许长简历自然多页 | ✅ |
| A4 | 响应式：新增 `≤768px` 断点，左右双栏改为上下堆叠、恢复整页滚动（替代 `transform: scale()` 挤压） | ✅ |
| A5 | 修复 P0 引入的回归：`.preview-actions` 由绝对定位单按钮改为 in-flow 可换行工具条（容纳 4 个按钮），并在打印时隐藏 | ✅ |
| A6 | 工作/教育条目「上移/下移」排序按钮（带 `aria-label`，首/末项禁用态） | ✅ |
| A7 | 提交进仓库的 Playwright 冒烟测试 `tests/smoke.mjs`（渲染、持久化+刷新恢复、排序、导入导出控件、可访问性） | ✅ |

**验证**：JSX 经 `@babel/preset-react` 编译无误；`tests/smoke.mjs` 10 项全过；长简历 `page.pdf` 产出多页且打印态隐藏编辑控件；`uvicorn` 起服务后 `/health`、`/api/analyze`（含缺字段 422）、`ALLOWED_ORIGINS` 限制均验证通过。

### 未做的可选项（按需再议）
- A8 后端 `pytest`（`TestClient`）；
- 「AI 分析」UI 文案诚实化（当前 README 已注明其为占位，不做真实分析）；
- 导入导出 schema 向 [JSON Resume](https://jsonresume.org) 靠拢（与 B7 衔接）。

## Phase B — 需架构决策（待 go/no-go）

**关键决策：是否引入 Vite 构建。** 引入则解锁下列多数项，代价是失去「零安装、直接开 html」特性、新增 Node 依赖。

- **B1** Vite 迁移（ES 模块、压缩版 React、HMR）——多项的使能前提。
- **B2** 组件化：抽 `<Field>` / `<ListSection>` / `formatDateRange()`，消除 work/education 重复 CRUD 与日期拼接重复。
- **B3** 真·文本可选 PDF（`@react-pdf/renderer`）或 DOCX 导出。
- **B4** 多模板 / 主题（布局 + 配色/字体切换）。
- **B5** ATS 模式 + 真实简历完整性检查器（替换当前占位的「AI 分析」框）。
- **B6** 前端测试（Vitest + RTL，依赖 B1）。
- **B7** 多份简历管理、Projects/Certifications 段、JSON Resume 标准适配。
