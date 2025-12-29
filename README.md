> **Static-first Production Application** | Document translation UI (PDF/DOCX/PPTX) with side-by-side compare

## 🔗 **Live Demo**

- **Demo**: _Add your deployed URL here_ (this repo builds a static site into `out/`)

[![Next.js](https://img.shields.io/badge/Next.js-Framework-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-Library-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-SDK%20%26%20Types-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-Data%20Fetching-FF4154?style=flat-square&logo=react-query)](https://tanstack.com/query/latest)
[![i18next](https://img.shields.io/badge/i18next-I18n-26A69A?style=flat-square&logo=i18next)](https://www.i18next.com/)

---

## 🚀 Project Overview

**EdgeNTranslate** is a static-export Next.js application focused on **document translation workflows**—upload files, track “runs”, and compare original vs translated documents (PDF viewer/compare UI).

This repository is built with a **static-first deployment model** (`next.config.ts` uses `output: 'export'`), making it easy to host on platforms like GitHub/GitLab Pages or any static hosting provider.

### Key Highlights

- **Static export ready**: builds to `out/` with `next export`-style output
- **Document formats**: `.pdf`, `.docx`, `.pptx` (see `lib/constants.ts`)
- **Translation workflow UI**: “runs” list + status + file actions
- **Compare experience**: side-by-side PDF compare viewer for input/output
- **Internationalization**: locale JSON files in `public/locales/*`

---

## 📱 Application Features

### Document Translation Workflow

- **Upload files**: drag-and-drop style upload + file tracking
- **Language selection**: target language picker with curated + regional lists
- **Runs dashboard**: view translation runs, statuses, timestamps, and token stats (demo values)

### PDF Compare / Preview

- **View input vs output**: open compare dialog for translated runs
- **PDF rendering**: in-app viewer (powered by `react-pdf`)

### Account / UI System (WIP)

- **Profile screens**: user settings screens and UI scaffolding
- **Billing config scaffold**: plans/features configuration under `lib/config/billing.config.ts`

---

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Build a static production export into ./out
pnpm build
```

---

## 🔧 Configuration

This project validates its required public env vars at build/runtime (see `lib/config/app.config.ts`).

### Environment Setup

Create a `.env.local`:

```env
# Required (app metadata)
NEXT_PUBLIC_PRODUCT_NAME="EdgeNTranslate"
NEXT_PUBLIC_SITE_TITLE="EdgeNTranslate"
NEXT_PUBLIC_SITE_DESCRIPTION="Translate documents while preserving layout"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_LOCALE="en"
NEXT_PUBLIC_DEFAULT_THEME_MODE="system"
NEXT_PUBLIC_THEME_COLOR="#0ea5e9"
NEXT_PUBLIC_THEME_COLOR_DARK="#22c55e"

# Required (billing provider selector)
NEXT_PUBLIC_BILLING_PROVIDER="stripe"

# Optional (UI preferences)
NEXT_PUBLIC_USER_NAVIGATION_STYLE="sidebar"
NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED="false"
NEXT_PUBLIC_EXPAND_SIDEBAR_ON_HOVER="true"

# Optional (static hosting under a sub-path, e.g. GitLab Pages)
BASE_PATH="/edgentranslate"

# Optional (skip some production-only validations in CI)
NEXT_PUBLIC_CI="true"
```

### Static Hosting Notes

- **Output folder**: the production build is generated into `./out`
- **Sub-path deployments**: if hosting under a sub-path, set `BASE_PATH` (used by `next.config.ts` for `basePath` + `assetPrefix`)

---

## 🤝 Contributing

This is a personal portfolio project, but **ideas, issues, and suggestions are always welcome**. Feel free to open an issue or submit a merge request if you see something that could be improved.

---

## 📄 License

This project is for personal portfolio purposes. **All rights reserved.**

---

**Contact**: [LinkedIn](https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/) · [GitLab](https://gitlab.com/miguel-lourenco-main) · [Email](mailto:migasoulou@gmail.com)
