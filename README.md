# 📖 Pdf-to-Book — Smart Book Reader

> **Transform ordinary, clunky PDF books into structured, beautifully formatted, offline digital reading experiences.**

[![GitHub](https://img.shields.io/badge/Author-Muhammad%20Saeed-blue?style=flat&logo=github)](https://github.com/Saeedbuneri)
[![Repository](https://img.shields.io/badge/GitHub-Pdf--to--Book-orange?style=flat&logo=github)](https://github.com/Saeedbuneri/Pdf-to-Book)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=flat&logo=vite)](https://vitejs.dev/)

---

## 🌟 Overview

**Pdf-to-Book (Smart Book Reader)** is a local-first, privacy-respecting web application designed to turn raw, text-based PDF books into modern, distraction-free reading environments. 

Instead of endless scrolling, awkward multi-column zooming, and tiny PDF fonts, **Pdf-to-Book** analyzes the PDF's structural hierarchy, extracts chapters and sections, and renders comfortable, responsive book pages with:

- 📑 **Hierarchical Table of Contents & Chapter Navigation**
- 💻 **Syntax-Detected Code Blocks** (TypeScript, Python, JavaScript, Java, SQL, etc.)
- 📐 **Rendered LaTeX Math Equations** via KaTeX
- 🔍 **Instant In-Book Full-Text Search**
- 🎨 **Multi-Color Highlights, Margin Notes, and Bookmarks**
- 🌓 **Reading Themes & Customization** (Paper, Dark, Sepia, Midnight, customizable widths, and typography)
- 📄 **Synchronized Original PDF Inspector** (Jump back to the exact source PDF page whenever needed)
- 💾 **100% Local-First Storage & Offline Privacy** (Zero uploads to servers, zero accounts, powered by IndexedDB)

---

## 🚀 Key Features

### 1. Intelligent PDF Structural Analysis
- **Automatic Outline Extraction**: Parses PDF document trees and TOC structures into chapter-by-chapter reading sections.
- **Smart TOC Filtering**: Detects and skips front-matter and table-of-contents pages to prevent TOC items from polluting actual chapter content.
- **Dynamic Font & Layout Heuristics**: Accurately differentiates major chapter titles, sub-headings, prose paragraphs, and code snippets.
- **Hyphenation & Prose Flow**: Joins broken PDF line wraps and hyphenated words for seamless paragraph flow.

### 2. Tailored Reading Workspace
- **Reading Themes**: Cozy Paper, Modern Dark, Warm Sepia, and Midnight palettes.
- **Font Selection**: Elegant book serif (`Newsreader`), clean UI sans (`Inter`), and monospace (`JetBrains Mono`).
- **Adjustable Widths**: Narrow, Normal, Wide, and Full-width layouts.
- **Keyboard Shortcuts**: Left/Right arrows for topic navigation, `/` or `Ctrl+K` for instant search, and Escape for modal dismissal.

### 3. Study & Annotation Tools
- **Text Highlighting**: Select any passage and highlight in 5 distinct colors (Yellow, Green, Blue, Purple, Pink).
- **Personal Margin Notes**: Attach thoughts and annotations directly to specific paragraphs.
- **Markdown Export**: Export all personal highlights and notes for any book into a clean `.md` document.

### 4. Zero Cloud Dependency
- Everything runs 100% locally in your browser.
- Books, extracted chapters, and annotations are saved inside your computer's browser IndexedDB via Dexie.js.
- Complete data export and backup restoration (`.json`) with one click.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PDF Engine**: [Mozilla PDF.js](https://mozilla.github.io/pdf.js/)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Math Rendering**: [KaTeX](https://katex.org/)
- **Iconography**: [Lucide React](https://lucide.dev/)

---

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) / [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Saeedbuneri/Pdf-to-Book.git
   cd Pdf-to-Book
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The optimized production bundle will be generated in the `dist` directory.

---

## 👤 Author & Ownership

This project is created and maintained by **Muhammad Saeed**:

- **Name**: Muhammad Saeed
- **GitHub**: [@Saeedbuneri](https://github.com/Saeedbuneri)
- **Project Repository**: [https://github.com/Saeedbuneri/Pdf-to-Book](https://github.com/Saeedbuneri/Pdf-to-Book)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it.
