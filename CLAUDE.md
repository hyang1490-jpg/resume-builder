# CLAUDE.md — Resume Builder Codebase Guide

This document provides AI assistants with a complete understanding of this repository's structure, conventions, and workflows.

## Project Overview

**SparkResume (闪耀简历)** is a full-stack, WYSIWYG resume builder web application with:
- A split-screen editor (form on left, live preview on right)
- PDF export via browser print dialog
- AI-powered resume analysis via an external FastAPI backend
- Traditional Chinese design aesthetics (vermillion accents, ink-wash gradients, serif typography)

## Technology Stack

### Frontend
- **React 18** — loaded via CDN (no npm/build step)
- **JSX** — transpiled in-browser via Babel standalone (also CDN)
- **html2pdf.js v0.10.1** — PDF export
- **Lucide Icons** — SVG icon library (CDN)
- **Google Fonts** — Inter, Noto Sans SC, Noto Serif SC

### Backend
- **FastAPI** (Python) — single endpoint for AI resume analysis
- **Pydantic** — request/response validation
- **CORS Middleware** — permissive (all origins, all methods) — development only

### No Build Tooling
There is **no npm, webpack, vite, or any build pipeline**. The frontend runs entirely via CDN-loaded scripts in the browser. Python dependencies are installed directly in the system environment.

## File Structure

```
resume-builder/
├── index.html       # HTML entry point; loads all CDN scripts and local assets
├── main.py          # FastAPI backend (single /api/analyze endpoint)
├── src/
│   └── app.jsx      # Entire React application (~288 lines)
├── css/
│   └── index.css    # Full design system (~574 lines)
└── CLAUDE.md        # This file
```

## Key Files

### `index.html`
- Loads React, ReactDOM, Babel, html2pdf.js, Lucide from CDN
- Sets `lang="zh"` (Chinese)
- Links `css/index.css` and `src/app.jsx` as a Babel-transpiled script type
- Title: "闪耀简历 - 高级简历生成器"

### `src/app.jsx`
The entire frontend application in one file. Key sections:

- **State shape**: `personalInfo`, `workExperience[]`, `education[]`, `skills` (string)
- **Dynamic arrays**: work experience and education entries can be added/removed at runtime
- **AI analysis**: `POST` to `https://greedily-opacus-shantelle.ngrok-free.dev/api/analyze` with `{name, skills}`
- **PDF export**: triggers `window.print()` (print styles in CSS produce an A4 PDF)
- **ID generation**: `Math.random().toString(36).substr(2, 9)` for list item keys

### `main.py`
- FastAPI app with a single route: `POST /api/analyze`
- Request body: `{name: str, skills: str}` (Pydantic model)
- Returns: `{status: "success", message: str}`
- Hardcoded ngrok URL in the source — **update this when the tunnel changes**

### `css/index.css`
- CSS custom properties (variables) define the entire design system
- Two visual layers:
  - **Dark UI** (editor chrome): `#030712` background, `#6366f1` indigo primary
  - **Light Resume** (A4 paper): white background, `#8b261f` vermillion accent
- Critical `@media print` block — forces colors, hides UI chrome, preserves A4 layout
- Glassmorphism on form panel: `backdrop-filter: blur(...)`
- Breakpoints: 1600px, 1400px, 1200px (scale/layout adjustments)

## CSS Design System

```css
/* Key variables */
--primary: #6366f1        /* Indigo — buttons, highlights */
--dark-bg: #030712        /* Near-black background */
--surface: #111827        /* Card/panel background */
--paper-bg: #ffffff       /* Resume preview */
--accent: #8b261f         /* Vermillion red — resume headings, dividers */
--text-primary: #f1f5f9   /* Off-white body text */
--text-secondary: #64748b /* Muted text */
```

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| JS variables/functions | camelCase | `handleAddExperience` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleChange` |
| CSS classes | kebab-case | `form-section`, `resume-paper` |
| Python variables | snake_case | `resume_data` |
| IDs (list items) | random alphanumeric | `Math.random().toString(36).substr(2,9)` |

## Development Workflow

### Running the Frontend
Simply open `index.html` in a browser. No build step required. All dependencies are CDN-loaded.

For local development with a live server (recommended to avoid CORS issues with file://):
```bash
python -m http.server 8080
# Then visit http://localhost:8080
```

### Running the Backend
```bash
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
```

The frontend currently points to a hardcoded ngrok URL. To use a local backend, update the fetch URL in `src/app.jsx`.

### PDF Export
Click the "导出PDF" (Export PDF) button in the UI. This triggers `window.print()`. The `@media print` CSS handles layout — no external library call needed beyond loading html2pdf.js.

## External Dependencies & Hardcoded Values

| Value | Location | Notes |
|-------|----------|-------|
| ngrok URL | `src/app.jsx` (fetch call) | Temporary tunnel; update when it changes |
| ngrok URL | `main.py` (comment) | Reference only |
| React CDN | `index.html` | `unpkg.com/react@18` |
| Babel CDN | `index.html` | Required for JSX transpilation |

## Security Notes (Development-Only Posture)

- CORS is fully open (`allow_origins=["*"]`) — not safe for production
- No authentication or input sanitization
- No environment variable management (all config is hardcoded)
- Before any production deployment: restrict CORS, externalize secrets, add input validation

## Git Conventions

- Branch naming: `claude/<description>-<id>` (e.g., `claude/add-claude-documentation-0Em6r`)
- Commit messages may be in Chinese (project author is Chinese)
- Remote: `http://local_proxy@127.0.0.1:39591/git/hyang1490-jpg/resume-builder`
- GPG/SSH signing is configured — do not skip with `--no-verify`

## What Does NOT Exist (Yet)

- No test suite (no Jest, Pytest, or any test files)
- No CI/CD pipeline
- No Docker configuration
- No environment variable management (.env)
- No linter configuration (ESLint, Prettier, Flake8)
- No TypeScript

When adding any of the above, follow the existing stack: plain JS/JSX for frontend, Python/FastAPI for backend.
