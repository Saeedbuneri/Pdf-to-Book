# Project Blueprint: Smart Book Reader

A local-first PDF-to-reading-space application that transforms ordinary text-based PDF books into beautifully structured, easy-to-navigate digital reading experiences — without uploading the user's books to a server.

The goal is not to build another PDF viewer. The goal is to make reading a long book feel like using a well-designed website, where chapters, topics, diagrams, code, formulas, and notes all have their proper place.

For the first version, everything runs locally on the user's PC. Books, extracted content, reading progress, bookmarks, settings, and notes remain on that computer. No account, cloud storage, or paid AI API is required.

## 1. The core idea

[Foliate — E-book Reader for Linux](https://images.openai.com/static-rsc-4/PKCBmI_oJmS3eJmpJ2cjPkRI7DbDal34QsbRG1UvtIpQJM9IYV8gdYX4ztmdGWN-RPf8-cQ7aR3rmJm-sySbmQRGlilNEu4VBR9-p1qxZ4RUcBwforKIdS_03N_77r_4HjaMpvmjZHNfY0F0R1zDdYLOTNQ_KqpFZHRNU90CdqM?purpose=inline)

[《仓颉编程快速上手》刘玥 pdf电子书\[48MB\]下载-码农书籍网](https://images.openai.com/static-rsc-4/27O4kebse6fsDY9g7-dA_5NiL_pz8esGKeryvyDWRlXWSTwoi4Y4XQ1gfBk4V2hPLfBGE2UApr_TWiSy3LQgBStPDLtkBENCpUFJZo-VSAc4uZFvvdpmDDmwPAoc7r0ug-WftSuMNsJZ81e97qH06LIkU-eL_vja00BVCQyyMc8?purpose=inline)

[Book Reading Habit](https://images.openai.com/static-rsc-4/cuz3UoH5gqhtR0IYdlFvGmAg-VcTwTaJFGq68HEGhoxVJdUzchfGE_tzqNT8lzhitOKJ7D6WmWFcEhlEKT9S30f7A91nAN9usY-KFueZMBXWLKjNVecskPGuZbYrafoFVmfuZUoccmMDf_65R4FPl3JwvuQd63aU2neMk57exs0?purpose=inline)

10

A user imports a PDF. The app analyzes it, identifies its structure, and builds a reading experience with:

- A hierarchical chapter and topic sidebar.
- Comfortable, responsive reading pages instead of endless PDF scrolling.
- Properly rendered headings, paragraphs, lists, code, formulas, tables, and figures.
- Navigation between topics and subtopics.
- Search, bookmarks, highlights, personal notes, and reading progress.
- A way to jump back to the exact original PDF page whenever necessary.
- Local data-management controls to inspect storage, export books, clear temporary data, and permanently delete selected content.

The original PDF remains the source of truth. The app creates a structured reading layer around it, so the experience can improve without silently changing the author's content.

## 2. Product principles

Fast by design

Open the first readable section as soon as possible. Analyze the remaining pages in the background instead of processing the whole book before showing anything.

Local and private

No book uploads, external processing, or mandatory account. The user controls the files and local data.

Smart, but predictable

Use document structure and layout rules first. Use optional local intelligence only when needed. Never invent missing book content or silently rewrite the author.

Memory efficient

Keep extracted text as the main content, load figures only when needed, and render only the visible reading pages.

Content-aware design

A programming book, a novel, and a mathematics textbook should not all look identical.

## 3. Complete user journey

Step 1 — Import a PDF

Select a local file, validate it, and show its size and page count.

Step 2 — Analyze the book

Read metadata, detect the table of contents, extract text in batches, identify figures and tables, and track extraction progress.

Step 3 — Build its structure

Create chapters, sections, subtopics, content blocks, and links to original PDF pages. Flag uncertain results for review.

Step 4 — Start reading

Display the first ready section immediately. Continue indexing and preparing later sections in the background.

Step 5 — Save locally

Store progress, notes, bookmarks, and layout preferences on the PC.

If a PDF is scanned and contains images of pages rather than selectable text, the app should clearly explain that OCR is needed. The initial version should focus on text-based PDFs rather than pretending all PDFs can be extracted perfectly.

## 4. Complete UI/UX design

The UI should feel like a premium reading workspace, not an admin dashboard. Keep the interface quiet, organized, and focused on the book.

### A. Home screen — Library

[BookSphere – Modern E-Reading & Audiobook Dashboard by Shahriar Sultan on Dribbble](https://images.openai.com/static-rsc-4/j5Tn7Prye6K93VOTCdPNorako4y3LLA9gZoMMBtU9dfogRBO6eRc0UezGiGjWMT5U6OtuCBp-Xgk06KVQQ7-BszCkA4bqAONLnvDtKesQ-8QiOou0H924MtCap8513vLAK_llSkJmuO6AxQxX52xVCd5COHeVxRPUzEc4DbAvlY?purpose=inline)

[Reading Web App UI Design by Ronas IT | UI/UX Team on Dribbble](https://images.openai.com/static-rsc-4/D4ht7oMr_MVpc58MtHchtkZoPmeC8Ab8CaP_ofehF8ExVUq2MgwHKxm4CjZCGVUOOcdoEO93MuTLYOgrZrglz0bfa2SGs950lMkkG0TZ5G0cYrr2FWKRtGv5EjHCxEvk4o51i65r66-wLoRLDoFbaKiHhe7o4mc6tzivgqPW6h4?purpose=inline)

[Koodo Reader: All-in-one e-book reader that can help you better manage and study your e-books. | AlternativeTo](https://images.openai.com/static-rsc-4/PMBnfakw35sxq9TlrjNdVrH6TPP0fIdlRE1lyQCcURPWGTo_lSU4OaW6Yvo4tA5S822kYR8TL3dX_JmET6Lz3f84BoQEPrXydC5prst2S5ZhgCA_WOd-GMEChQgbFkHFTg_inUD8B2RSangcxVYydC0wNgTK_uGH6WLzCWiKTvQ?purpose=inline)

8

The home screen should contain:

- Continue reading: the last opened book and the exact saved position.
- Your library: imported books with cover, title, author if available, progress, and last-opened date.
- Import book: a prominent button and drag-and-drop area.
- Search library: find books by title or author.
- Recently added and Recently opened filters.
- Storage indicator: show how much local space the app is using.
- Settings and Data Management: accessible from the main navigation.

Each book card should offer a small menu: Open, Book details, Export, Remove from library, and Delete book and its local data. The destructive options must be clearly different.

### B. Reader screen — the main experience

[Cara Membangun AI Agent Pertama Anda dengan OpenAI Agents SDK: Tutorial Lengkap Step-by-Step](https://images.openai.com/static-rsc-4/cWmPXVsScPQx6F7l2RasK6BIaGN1KCwhHWOOLaiKeGlKjkm8cFP_Kv2pj8GQ6bIAnezlW8OjtslKQVVphqRSYK71ROgl6RmArFFRy5fNWQr7-D_wUGYGk7SKZYhlo5Q1G1CbSOAsGvt6GDeJV0N1gpMpxxc2DEayHB-9UJfXuQY?purpose=inline)

[真开源跨平台电子书阅读软件 Readest，即将发布正式版本 1.0 - V2EX](https://images.openai.com/static-rsc-4/8lcm31txzRbmx_tvTcQpHxpLu0lOsA2vtT2Q1j8UXirXOpDvJnAfYFdhj_yMeRohXaIZOUfkIArH260XlADyp963nnBUvDioDyWY3xUpfIClGtyiZBi70irDgJS5ysmqY7UGkOU-OYD74h5rbCaWqg1dTLLVYLMbVDK59R1VF-8?purpose=inline)

[Cheatsheets and other 8 ExDoc features that improve the developer experience - The Elixir programming language](https://images.openai.com/static-rsc-4/YpsM7SdQ9f605HEUo4wubbQFsAGcCbNETp-AnsT8YodeDGzxoRAOyV_lbBUB9R05VfwH3Pw8x4yqdVdSFkzEd6AmWDnDyvwqD4WsP0HTrhofDBIkwtYe9rc61cOo7M9vtk7s9bZ2T3asIciP8tH4XP9NF1FzWui2sXWAg9F7aNc?purpose=inline)

10

Use a three-panel layout on desktop.

Book title / Chapter 3 / Topic 3.2

CONTENTS

Chapter 1

Chapter 2

Chapter 3

3.1 Overview

3.2 Main concept

3.3 Examples

Chapter 4

CHAPTER 3 · TOPIC 3.2

# Understanding the concept

A short introduction that sets the context for the topic.

The main idea

Readable paragraphs with comfortable line spacing, consistent margins, and clear separation between ideas.

Key concept

An optional highlighted definition or important note taken from the source.

Source: PDF page 42

ON THIS PAGE

The main idea

Key concept

Bookmarks

My notes

Chapter progress

42%

← Previous topic

Next topic →

Illustrative layout concept, not a screenshot of the finished application.

Left panel — Book structure

- Expandable chapters, topics, and subtopics.
- Current topic clearly highlighted.
- Optional completion indicators.
- Click any topic to jump directly to it.
- Search results reveal the matching text and its location.

Center panel — Reading canvas

- Clear chapter and topic headings.
- Comfortable line length, margins, and spacing.
- Content-aware rendering for images, code, formulas, and tables.
- Previous/next topic controls.
- Source PDF page references.
- No unnecessary cards around every paragraph.

Right panel — Context tools

- Current-page outline.
- Key concepts, where useful.
- Bookmarks and personal notes.
- Optional figure list and original PDF reference.
- Collapsible when the user wants more reading space.

On smaller screens, the sidebars should become drawers. The reader itself should never become cramped just to keep three columns visible.

### C. Every content type gets its own layout

[New styles for code examples in the OCaml reference manual - Ecosystem - OCaml](https://images.openai.com/static-rsc-4/T7JhcYx8APAkZlpH-fEYWNtw451uDIE48REJgZyNL8GM4JVxtaQsD5vkVYAFBNJkP3kAHXW7oIdwvcyP3ooyne3pTbadJlEBcsVOMpUn7LQADwZo6oAF2v167D_7mZGZtxCLPG7qrf3nEgWEC2rAcG1afBB1nau5uDSPYWCnLJY?purpose=inline)

Programming and system design

Render code in syntax-highlighted blocks, preserve indentation, add copy buttons, and display diagrams close to their explanations. Keep long code examples together when possible.

[Apologia Educational Ministries  - Exploring Creation with Advanced Biology | Sample - Page 20](https://images.openai.com/static-rsc-4/zdw3e-Ky8uXzwjiJRb_sHgEiAXpTQLICTCoH4_1Ndyw7JS918wne5Zr9aSAsC1qVwYp9DCrVlqnbJ7yxTVnp3SKmbAKzc27CCgqDnnarb9PMSKP-meffHXZPzJMv5Q5s9ehME45jWfHEry_Lom3UvNJrsT7bXwA5cufImgqCcEw?purpose=inline)

Science and mathematics

Support equations, formulas, worked examples, tables, and figures. Keep the explanation beside the formula or diagram it refers to.

[DREAM A WORLD ANEW](https://images.openai.com/static-rsc-4/vG371ioevTTyJNKYz0P4_KoNoDl3QLTWf6tHX3qnMD-QMUNNV_7mF9394xaagzTrBDmcBsdcmwzlYt09GG6eTFNAC37bOw4OmGeBsuHDteTkwCcECbmMtpTdMIvwjcpy3ouHra6iS0660AWdwhGMIvoW_g0IfqECNdOYnjtBXS8?purpose=inline)

History and social sciences

Support timelines, dates, quotations, maps, captions, and side notes when the source supports them.

[Insight Sandbox Test 042514](https://images.openai.com/static-rsc-4/UnZjl3mFJRxXhsGJOieVCwHU9qbtqkCShLQUX_2ZP0T6rNu6cwiSiR_xuhxUKasBszGWkDCvZr_K44sAM--dTNLzis7gHM8zfNv2-G94at9_zWlKqbhM5KSNRI0XmrfyOMzohGJu6SRfJIS49wPjcKZ4qopZKB8QCcGT30avNbk?purpose=inline)

Novels and ordinary prose

Use a distraction-free reading mode. Preserve paragraph order, dialogue, and narrative flow. Do not inject summaries or extra cards into the story.

These are rendering modes, not four separate applications. The same underlying book model chooses an appropriate renderer for each content block.

### D. Reading and personalization controls

Include a compact reading-settings panel:

- Themes: light/paper, sepia, and dark.
- Font size, line spacing, and reading width.
- Serif or sans-serif reading font.
- Focus mode to hide both side panels.
- Full-screen mode.
- Figure zoom and pan.
- Keyboard navigation: previous/next topic, search, bookmark, and sidebar toggles.
- A setting to prefer topic navigation or original PDF page navigation.

Font and layout changes must not make the user lose their reading position.

### E. Search, notes, and bookmarks

Search should work on extracted book text without requiring an AI service. Results should show a short excerpt, chapter/topic, and source PDF page.

Users should be able to:

- Bookmark a section.
- Highlight a passage.
- Attach a personal note to a passage or topic.
- Reopen the exact source PDF page.
- Export notes and bookmarks independently from the book.
- Search across their local library, if they choose to enable library-wide indexing.

Avoid turning the app into a social platform or an AI chatbot. The primary job is to make reading better.

## 5. How the smart processing engine should work

The most important engineering decision is to separate the book's content, its structure, and its visual layout. They should not be stored as one giant HTML document.

Original PDF

Source file; preserve the original

PDF analyzer

Metadata, text, headings, page coordinates, figures

Structured book model

Chapters, topics, blocks, references, confidence scores

Content-aware layout engine

Splits content into readable screens and preserves block integrity

Reader UI

Renders only what the user needs now

### The processing rules

1. Read in stages. First obtain the metadata and document outline. Then extract pages in small batches. Make the first usable chapter available before the entire book has been analyzed.
2. Use evidence before guessing. Prefer the PDF's embedded table of contents, heading styles, numbering, font sizes, and spacing. Infer missing headings only when there is enough evidence.
3. Keep confidence and source references. Each inferred section or figure association can carry a confidence value and original page reference. Uncertain content should be flagged, not presented as certain.
4. Separate semantic sections from reading pages. A topic can contain many reading pages. Do not make a 10,000-word chapter one giant screen, and do not split every fixed number of words regardless of meaning.
5. Keep related blocks together. Avoid separating a heading from its introduction, a figure from its caption, a table from its heading, or a code example from its explanation.
6. Paginate when needed. Calculate visible reading pages using the available width, font settings, images, and block heights. Recalculate layouts when necessary, but keep the extracted content unchanged.
7. Save checkpoints. Record which pages are extracted, which sections are ready, and which processing version was used. If the app closes, it should resume instead of starting over.
8. Preserve fidelity. If the extractor cannot confidently determine reading order, table structure, or figure placement, provide a way to inspect the original PDF.

### Speed and memory strategy

- Process small batches rather than loading and converting an entire book into a massive object.
- Use a PDF.js worker so parsing does not freeze the reader interface.
- Virtualize long topic lists and reading pages; only mount nearby content.
- Decode large figures only when they become visible and release them when appropriate.
- Keep a single canonical text/block representation; avoid repeatedly copying it into multiple data structures.
- Build the search index incrementally.
- Cache expensive calculations, but version those caches so they can be rebuilt after a software update.
- Handle cancellation, corrupt pages, and storage failures without losing already-saved work.

Important: a small PDF can still contain huge images, and a large PDF may mostly contain compact text. Optimize based on extracted content and actual memory usage, not only the PDF file size.

## 6. Recommended technology stack

For the first version, I recommend a TypeScript-based, local-first web application with no application backend.

[Next.js Logo Vector Free Download | Logowik](https://images.openai.com/static-rsc-4/mUgR9EQlKOc0ZIpOnhYZhazJ_YVofBYxjwNAr2HRG48-5wFR7xu-bUB-hKVXhSf_lZgjCMNUuw8TQiIDYJEFKZScc0e7fU_GLJLrhPVR5FPYMjNMTFDySkF2UEyM8_bIHu6rKHeNhicN21gYi0dN-xuySfa7tZTocg14sJoQVMo?purpose=inline)

Next.js + TypeScript

Application framework and shared codebase

Build the library, reader, settings, and reusable components. Use a static client-side deployment where practical; PDF processing and user data should stay in the browser.

[React Logo Vector PNG | Modern JavaScript UI Library Emblem  - freepng](https://images.openai.com/static-rsc-4/v_YRxkVgaIO4SDeoNvs8wqFWCUPPpZZsL5kVx_ktDQiKtZgMAHiSkxHMJjDkyVuTICNI24RF-lwOIJxaeydWu09nWdyQFsirfUWfJani7GSpYOfLBE-LNBdDDc_8acLBouV10tSEh5cWrc3WFWUieGkP2unLzBMX37Q6Sq2WqGs?purpose=inline)

React

UI components

Build the book cards, sidebars, reading canvas, settings panels, and content renderers as separate components.

[Tailwind CSS Wordmark Logo PNG Vector (SVG) Free Download in 2025 | Word mark logo, Css, Vector logo](https://images.openai.com/static-rsc-4/iecL2Ab__eIJwMwWSQ0fsqaBOaRDQFYLB-PDmu7IyVB8sQq_th1AxXOVxgdKZ0__waTfGwLIHYI4No0nWeY3abP5vL0ik4OIKb_SFE1RmSR6viDxHB2N5Jlaoxv7T0mE1rB805ZIq_i5LMEB_tcI-NrF_idJ0XCmapBO7bf09Bs?purpose=inline)

Tailwind CSS

Styling and responsive design

Create a consistent design system for spacing, typography, themes, responsive panels, and reusable layouts.

[File:Pdf-js logo.svg - Wikimedia Commons](https://images.openai.com/static-rsc-4/t_v0ALpNwTtXso-dNwwXaERrkamHHrM_hSiO1Tqqy8LU4SregIugh9_CKgybuBPdUu2hYUqIH7I3tx3pvN0e-dVhE3bj2YEVZeLgowG5ttGNTGQYg_8rWB-0pOllfqphH5PT-y-1FThM-9rtDtQ18goT2i4s8Ae5rrVywcpzNFo?purpose=inline)

PDF.js

PDF reading and extraction

Extract selectable text, inspect document metadata and outlines, and render original PDF pages for reference. Keep it in a worker where appropriate.

[🚀 Dexie.js: Build Real Database-Powered Web Apps — No Backend Required | by Kavindu Peiris | Feb, 2026 | Medium](https://images.openai.com/static-rsc-4/PYTwPF9IM4jvhPJOeOoujr1mXMVggxrVww6nsbJ56JZcV9nTk9GAyokMftirrkB_5tAGKRuD7XezG6bQBIryIvuf98ewY9h5u3FXjcdPNSf2YwNCFOVBwyNKpyxpUxFsLcBLa6Pv2BMHqS-HvrN9Lv29LDDc52b1HmldhrcxiIE?purpose=inline)

IndexedDB + Dexie.js

Structured local database

Store book records, extracted blocks, section trees, reading progress, bookmarks, highlights, notes, and processing checkpoints.

[軽量な数式組版ライブラリ KaTeX  の導入メモ | t3nro.net](https://images.openai.com/static-rsc-4/envGmMY5eE1jxwLaaRJuesoVKdaNb7qEbf3IdHhFWyWaIY3sP_N5uLsOsgbCV_tQk57FF_QA5mSDYWeFIlQgzboZFmH-9yDtKIplGDMUGzSr288GcesjWc5FZIAtoQ6MM1M716Q5fzYTyvRiYTItSHqbbyX1h3h9fK8ubmE7E-g?purpose=inline)

KaTeX + Shiki

Specialized content rendering

Use KaTeX for supported mathematical expressions and Shiki for syntax-highlighted programming examples. Render only the appropriate content type.

[GitHub - vite-pwa/vite-plugin-pwa: Zero-config PWA for Vite · GitHub](https://images.openai.com/static-rsc-4/iH6cr9zG9VqG28GZ2jwHd41XmrtRMeMjPWe7f7MloHms81ZzLRFCPhdO7MPq88WaNEXdC8ffhC7O0yx4wU6r5pJHPKiUM3I6cQgmCfXcVtyUQ4WfXb2Fd3WSjX4dcujiP-fqveXNGdZi-9oonOHnPoikDJ9eHDF8e_w6bLahDwM?purpose=inline)

PWA support

Installable web experience

Provide an installable app shell and offline access after the app assets have been cached. Book data is stored separately from the app shell.

Other useful choices:

| Need                                | Recommendation                                     |
| ----------------------------------- | -------------------------------------------------- |
| Component styling                   | Tailwind CSS + CSS variables                       |
| Icons                               | Lucide                                             |
| Validation                          | Zod                                                |
| Unit and integration tests          | Vitest + React Testing Library                     |
| Browser-level tests                 | Playwright                                         |
| Math formulas                       | KaTeX                                              |
| Large lists and virtualized content | TanStack Virtual, where needed                     |
| Local database                      | IndexedDB through Dexie.js                         |
| Large local files and binary assets | OPFS or browser file-system access, with fallbacks |
| Optional future desktop package     | Tauri                                              |
| Optional future Android package     | Capacitor                                          |

You do not need all these libraries on day one. Add them when the relevant feature is being built.

### Why not add a backend, MongoDB, Firebase, or an AI API?

Because none is necessary for the initial product.

- No backend means no server bill for storing users' books.
- No cloud database means no remote synchronization or account system to maintain.
- No AI API means no token charges and no need to upload private content for analysis.
- No external processing means ordinary extraction can work offline after the application assets are available.

The initial analyzer should be deterministic and rule-based. AI can be considered later as an optional feature, but it must not be a requirement for reading a book.

## 7. Local storage design — the most important part

The application needs an explicit storage architecture, not just a vague promise to save things in the browser.

### What goes where?

IndexedDB — structured book data

Book metadata, chapter tree, extracted text blocks, progress, notes, highlights, bookmarks, search metadata, and processing checkpoints.

OPFS or a user-selected folder — larger files

Original PDFs, cached assets, and other large binary data when the selected browser storage method supports them. OPFS is managed by the browser; it is not the same as a normal folder visible in File Explorer.

Small settings

Theme, font size, reading width, panel visibility, and other simple preferences can live in localStorage.

Temporary processing memory

PDF parsing buffers, current figure decodes, temporary layout results, and worker state. Release these when no longer required.

My recommendation: use IndexedDB as the main database, and choose a deliberate strategy for the original PDF. For a browser-first app, you can store the PDF in IndexedDB initially, then move large-file handling to OPFS or a user-selected local folder if that proves beneficial. Do not store a large PDF as a Base64 string in localStorage.

### Storage rules that make the app reliable

1. Give each imported book a stable ID.
2. Store extracted content once, and reference it by block ID.
3. Keep the original PDF separate from its derived reading structure.
4. Version extracted content and layout caches so they can be rebuilt after changes.
5. Save progress and annotations incrementally.
6. Do not mark a book as fully processed until its content and database writes have succeeded.
7. If the user removes a book, clean up its related records and owned file data together.
8. If the original PDF is missing, show the book's status and offer relinking or deletion rather than silently failing.

### Browser storage limitations

Browser storage is local, but it is not identical to a guaranteed permanent folder on the PC. The browser can impose quotas, storage can be cleared by the user, and some storage can be evicted. Persistent storage can be requested, but it is not an absolute guarantee against disk failure, profile deletion, or user-initiated clearing.

That means the product should provide export, backup, and clear deletion warnings from the beginning.

If reliable access to ordinary Windows folders and explicit control over files becomes a core requirement, a Tauri desktop version may ultimately be a better PC product. The document-processing core can still be shared with a browser version.

## 8. The Data Management screen

This is a first-class feature, not an afterthought. The user must understand what the app stores, where it stores it, and what each cleanup action will remove.

## Storage & Privacy

Illustrative example of the settings screen.

Local storage used

## — MB

Actual usage and quota are shown only when the browser can report them.

Original books

List each book, original filename, storage location, and file size where available.

Actions: export, relink, remove from library, delete stored copy.

Extracted data

Show approximate space used by text, structure, indexes, bookmarks, and notes.

Actions: rebuild extracted content, clear search index, remove selected book's derived data.

Temporary cache

Disposable render caches and temporary processing artifacts.

Action: clear temporary cache without removing original books or personal notes.

Privacy and backup

Explain local storage, export options, and what browser-data clearing means.

Actions: export backup, import backup, clear reading history, reset preferences.

### Required delete and clear options

| Action                     | What it should remove                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Clear temporary cache      | Disposable caches only                                                                                     |
| Clear search index         | Search index only; it can be rebuilt                                                                       |
| Clear reading history      | Reading history and optionally saved positions, with clear wording                                         |
| Reset preferences          | Theme and reader settings, not books or notes                                                              |
| Remove from library        | Remove the library entry; explain whether the original file is kept                                        |
| Delete book and local data | Original stored copy, extracted content, bookmarks, notes, highlights, progress, and book-specific indexes |
| Delete all app data        | All books and associated local data, settings, and history                                                 |
| Export backup              | Create a user-controlled backup of selected or all books and their supported metadata                      |
| Import backup              | Restore data with duplicate/conflict handling                                                              |

Every destructive action should have a confirmation dialog explaining the scope. “Delete all app data” should require an additional explicit confirmation. Never describe deletion as reversible unless the app actually has a working recovery mechanism.

### Backup and restore design

- Allow a user to export a book's original PDF and its notes/annotations separately.
- Offer a complete library backup, including original files only when selected and permitted.
- Use a versioned backup format, such as a ZIP containing a manifest, metadata, annotations, and optional original PDFs.
- Validate imported backup files before changing the existing library.
- Show the number of books and files to be imported and handle duplicates safely.
- Keep backups in a user-selected location; do not silently upload them.

A backup is especially important because browser storage can be removed outside the app through browser settings, profile deletion, or device cleanup.

## 9. Recommended code architecture

Keep the core document engine independent from the user interface and storage platform. This makes debugging easier now and makes it possible to reuse the same engine in a desktop or Android version later.

```

smart-book-reader/
├── public/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── library/
│   │   ├── reader/[bookId]/
│   │   ├── settings/
│   │   └── data-management/
│   │
│   ├── components/
│   │   ├── library/
│   │   ├── reader/
│   │   ├── navigation/
│   │   ├── dialogs/
│   │   └── settings/
│   │
│   ├── core/
│   │   ├── pdf/
│   │   │   ├── metadata.ts
│   │   │   ├── extract-text.ts
│   │   │   └── extract-figures.ts
│   │   ├── structure/
│   │   │   ├── detect-headings.ts
│   │   │   ├── build-outline.ts
│   │   │   └── content-model.ts
│   │   ├── pagination/
│   │   │   ├── paginate.ts
│   │   │   └── layout-cache.ts
│   │   └── search/
│   │       └── index.ts
│   │
│   ├── renderers/
│   │   ├── prose/
│   │   ├── code/
│   │   ├── math/
│   │   ├── tables/
│   │   └── figures/
│   │
│   ├── storage/
│   │   ├── database.ts
│   │   ├── book-store.ts
│   │   ├── progress-store.ts
│   │   ├── annotation-store.ts
│   │   ├── backup.ts
│   │   └── cleanup.ts
│   │
│   ├── platform/
│   │   ├── browser-files.ts
│   │   └── storage-adapter.ts
│   │
│   └── workers/
│       └── pdf-worker.ts
│
├── tests/
├── package.json
└── README.md

```

### The central data model

A simplified version of the internal model could look like this:

```

type ContentBlock = {
  id: string;
  type:
    | "heading"
    | "paragraph"
    | "list"
    | "code"
    | "math"
    | "figure"
    | "table"
    | "quote";

  text?: string;
  assetId?: string;
  sourcePages: number[];
  confidence?: number;
};

type BookSection = {
  id: string;
  title: string;
  blockIds: string[];
  childSectionIds: string[];
};

type BookRecord = {
  id: string;
  title: string;
  originalFileName: string;
  storageStatus: "available" | "missing";
  processingStatus:
    | "queued"
    | "processing"
    | "ready"
    | "partial"
    | "error";
  lastProcessedPage: number;
  extractionVersion: number;
};

type ReadingProgress = {
  bookId: string;
  sectionId: string;
  blockId?: string;
  characterOffset?: number;
  updatedAt: number;
};

```

This model keeps the structure separate from how it appears on screen. The reader can calculate new page boundaries without rewriting the extracted text or destroying bookmarks.

For example, a bookmark can refer to a stable block ID rather than “page 14.” If the user changes font size, the content may repaginate, but the bookmark can still point to the correct passage.

## 10. Error handling and reliability

The app should never assume every PDF is clean or well structured.

| Problem                            | Expected behavior                                                   |
| ---------------------------------- | ------------------------------------------------------------------- |
| Corrupt or password-protected PDF  | Explain the problem and offer a retry or alternative file           |
| No selectable text                 | Identify it as a likely scanned PDF and explain OCR requirements    |
| Incorrect reading order            | Allow access to the original PDF and flag the extraction            |
| Uncertain heading detection        | Preserve the text and allow outline correction                      |
| Figure or table extraction failure | Show the source page rather than inventing content                  |
| Browser storage quota reached      | Stop safely, explain the issue, and offer cleanup or export         |
| App closed during processing       | Resume from the last successful checkpoint                          |
| Original PDF deleted or moved      | Offer relinking, recovery from backup, or removal                   |
| App updated                        | Reuse compatible data and rebuild invalidated caches when necessary |

The app should also have tests for interrupted imports, failed database writes, duplicate imports, deletion consistency, and backup restoration. These cases matter just as much as a beautiful reader screen.

## 11. Can this later become a hosted web app or Android app?

Yes. The best way to preserve that option is to keep the document engine separate from platform-specific storage.

Shared TypeScript core

PDF analysis · document structure · content rendering rules · pagination · search

Web / PWA

IndexedDB, OPFS, browser file access

Desktop

Tauri and native filesystem

Android

Capacitor and app-private files

These are alternative packaging options, not three applications you need to build immediately.

- Web/PWA: simplest initial release. Users can install it through a compatible browser and keep their data locally. The app shell can be cached for offline use.
- Desktop: Tauri can provide more predictable access to PC files and storage-management features. It is a good option if you want a proper Windows application.
- Android: Capacitor can wrap the web UI and connect it to native file selection and app storage. Mobile memory constraints mean that extraction batch sizes and figure rendering must be tuned for phones.

A hosted static website does not mean book content is hosted. The application code can be downloaded from a website while book processing and saved user content remain on the device. However, the initial application download needs an internet connection unless the app has already been installed and cached.

If complete offline operation from the very first launch is required, provide a locally installed desktop package or a preinstalled/cached PWA. Browser storage also remains subject to browser-specific limitations.

## 12. Development roadmap

Build the product in small, testable phases. Do not attempt perfect automatic recognition of every book in the first release.

1. Phase 1 — Reader UI

   Create the library screen, three-panel reader, responsive sidebars, themes, navigation, and mock book content. Test the entire reading experience before implementing PDF intelligence.
2. Phase 2 — PDF import and extraction

   Add PDF.js, metadata extraction, text extraction, original page references, batch processing, and resumable checkpoints.
3. Phase 3 — Structure detection

   Build the outline from embedded document metadata and heading heuristics. Allow users to correct chapters and subtopics.
4. Phase 4 — Content-aware reader

   Add renderers for prose, headings, code, figures, tables, lists, and mathematical content. Build on-demand pagination.
5. Phase 5 — Local persistence

   Implement IndexedDB, progress saving, bookmarks, highlights, notes, storage usage estimates, and reliable cleanup.
6. Phase 6 — Backup and recovery

   Add export/import, interrupted-operation recovery, duplicate handling, missing-file recovery, and data-deletion confirmations.
7. Phase 7 — Performance and testing

   Test large books, complex layouts, memory use, storage failures, responsive screens, and reading-position preservation.

Test with at least five different PDFs: a programming book, a novel, a mathematics/science book, a two-column book with footnotes, and an image-heavy book with tables. This will expose design flaws earlier than testing with only one textbook.

## 13. What should be excluded from version one?

To keep the app fast, affordable, and achievable, do not initially add:

- User accounts or cloud synchronization.
- Mandatory AI or external APIs.
- Automatic OCR for every scanned PDF.
- Automatic rewriting or summarizing of the author's text.
- Collaborative annotations or social features.
- A complex plugin ecosystem.
- Automatic generation of illustrations to replace original figures.

First make the original book readable, structured, navigable, and safely stored. Optional OCR, local AI, and other advanced features can come later.

## Final recommendation

Build Smart Book Reader as a local-first TypeScript application using Next.js, React, Tailwind CSS, PDF.js, IndexedDB/Dexie, and a content-aware reading engine.

The most important design decisions are:

1. One structured book model: never mix the extracted source content with the screen layout.
2. Incremental processing: let the user start reading while later sections are still being prepared.
3. Virtualized rendering: only render the content needed for the current reading position.
4. Reliable local data management: provide clear storage information, deletion controls, and export/restore from the start.
5. Content-aware layouts: adapt to the type of material without changing or inventing the author's content.
6. Platform-independent core: keep storage and file access behind adapters so a desktop or Android version can reuse the same processing engine.



Hamari app ko safe kaise rakhen?
- navigator.storage.estimate() se storage usage check karo.
- navigator.storage.persist() se persistent storage request karo.
- PDF pages batches mein process karo; poori book RAM mein mat rakho.
- Har batch ke baad progress save karo.
- QuotaExceededError handle karo. 


The success metric is not how many AI features the app has. It is whether a user can import a long book, navigate it naturally, read without lag, resume exactly where they stopped, and trust that their local data will not disappear without warning.