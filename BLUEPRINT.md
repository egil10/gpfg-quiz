# GPFG Quiz — Design & Architecture Blueprint

> A complete reference for how this site is built, styled, and wired together — written so the project can be rebuilt or restyled from scratch without reading every line of source.

---

## 1. What it is

A single-page, **zero-build, zero-dependency** quiz about the ~187,000 companies held by Norway's Government Pension Fund Global (GPFG). Vanilla HTML + CSS + JavaScript, deployable as static files (GitHub Pages). No bundler, no framework, no package.json.

The user is shown a company (name, market value, ownership, plus some attributes) and must guess one hidden attribute — its **country, industry, region, or year**. Performance is tracked with an **ELO rating** persisted in `localStorage`, visualised in a hand-drawn `<canvas>` chart.

---

## 2. File structure

```
gpfg-quiz/
├── index.html              # Markup, meta, font + script loading
├── assets/
│   ├── css/style.css       # All styling: themes, layout, components, responsive
│   ├── js/script.js        # All logic: data, quiz engine, ELO, theming, modals
│   └── favicon.svg         # Inline SVG favicon
├── data/
│   ├── equities.json       # ~20 MB minified array of holdings (the dataset)
│   └── equities.xlsx       # Source spreadsheet (gitignored, not served)
├── README.md
└── BLUEPRINT.md            # This file
```

There is **no server code and no build step**. Open `index.html` over HTTP (file:// won't work because of the `fetch`) and it runs.

---

## 3. Data model

`data/equities.json` is a single JSON array of objects using **short keys** to keep the payload small:

```json
{ "n": "a2 Milk Co Ltd/The", "c": "Australia", "r": "Oceania",
  "i": "Consumer Staples", "y": 2025, "o": 1.43, "m": 548688979 }
```

| Short key | Meaning            | Expanded key (in-app) |
|-----------|--------------------|-----------------------|
| `n`       | Company name       | `NAME`                |
| `c`       | Country            | `COUNRTY` *(sic — typo preserved)* |
| `r`       | Region             | `REGION`              |
| `i`       | Industry           | `INDUSTRY`            |
| `y`       | Year (number)      | `YEAR`                |
| `o`       | Ownership %        | `OWNERSHIP`           |
| `m`       | Market value (NOK) | `MVAL_NOK`            |

> ⚠️ **`COUNRTY` is a deliberate, load-bearing typo.** Access code defensively reads `d.COUNRTY || d.COUNTRY` everywhere. If you regenerate the data or refactor, either keep the misspelling or rename it in *all* call sites at once.

On load, `loadData()` fetches the JSON and maps each short-key record into the expanded-key shape once. Distinct values for regions / countries / industries / years are precomputed into `gameState.filterOptions` so option generation and filter modals never re-scan the full array.

---

## 4. Visual design system

### 4.1 Theming model

Three themes are defined as CSS custom-property sets on `:root` / `[data-theme="..."]`. The active theme is set via `document.documentElement.setAttribute('data-theme', …)` and saved to `localStorage('theme')`. The in-app toggle only switches **light ⇄ dark**; `black` exists in CSS and `system` is resolved to light/dark at init.

| Token | Light | Dark | Black |
|-------|-------|------|-------|
| `--bg-primary`    | `#ffffff` | `#000000` | `#000000` |
| `--bg-secondary`  | `#ffffff` | `#0a0a0a` | `#0a0a0a` |
| `--bg-tertiary`   | `#f5f5f5` | `#141414` | `#1a1a1a` |
| `--header-bg` / `--footer-bg` | `#001538` (navy) | `#000000` | `#000000` |
| `--text-primary`  | `#0f172a` | `#ffffff` | `#e5e5e5` |
| `--text-secondary`| `#64748b` | `#888888` | `#a3a3a3` |
| `--text-tertiary` | `#94a3b8` | `#666666` | `#737373` |
| `--accent-primary`| `#3b82f6` (blue) | `#3b82f6` | `#3b82f6` |
| `--accent-hover`  | `#2563eb` | `#2563eb` | `#60a5fa` |
| `--success`       | `#10b981` | `#34d399` | `#34d399` |
| `--error`         | `#ef4444` | `#f87171` | `#f87171` |
| `--border`        | `#e2e8f0` | `#1a1a1a` | `#1a1a1a` |

**Signature colour:** the deep navy `#001538` used for the header and footer bars in light mode is the brand anchor. The accent throughout is `#3b82f6` (Tailwind blue-500).

Each theme also defines `--shadow-sm/md/lg/xl` (dark mode flattens most shadows to `none`) and `--transition` (`all 0.2s cubic-bezier(0.4,0,0.2,1)`). The `<meta name="theme-color">` is kept in sync with the header colour on theme change.

### 4.2 Typography

- **Font:** [`Space Grotesk`](https://fonts.google.com/specimen/Space+Grotesk) (Google Fonts), weights 400/500/600/700, loaded with `&display=swap`. Fallback stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
- **Base size:** `16px`, stepping down responsively to `15px` (≤768px) and `14px` (≤480px) via `html { font-size }`, so all `rem` units scale together.
- **Scale (rem):** title `1.5`, welcome H2 `2.5`, question `1.25`, body/options `1`, labels/stats `0.875`, footer fine print `0.625–0.8125`.
- **Antialiasing:** `-webkit-font-smoothing: antialiased`.

### 4.3 Spacing, radius, sizing conventions

- Spacing is a loose `0.25rem` scale: `0.5 / 0.75 / 1 / 1.5 / 2rem` are the common gaps/paddings.
- **Border radius:** `0.5rem` for buttons/cards/inputs, `1rem` for modals, `0.375rem` for small chips/focus rings.
- **Touch targets:** every interactive element has `min-height: 44px` (iOS guideline).
- **Container:** centered, `max-width: 1600px`; quiz content capped at `1400px`.
- **Icons:** [Lucide](https://lucide.dev) via CDN for static chrome (modal close, loading). Per-question company-detail icons are **inlined as raw SVG** (see §6.3) to avoid re-scanning the DOM.

### 4.4 Layout anatomy

```
┌─ header (navy bar) ───────────────────────────────────────────────┐
│ GPFG Quiz            [Year ▾] [Category ▾] [Apply]  [ELO] [Theme] │
├───────────────────────────────────────────────────────────────────┤
│  main (flex-centered)                                              │
│   • welcome-screen:  H2 + stats-grid (3 cards) + Start button     │
│   • quiz-screen:                                                   │
│        stats-bar: Correct · Answered · Accuracy · Pool · ELO      │
│        quiz-layout (2-col grid, collapses ≤1024px):               │
│          ┌ quiz-left ─────────┐  ┌ quiz-right ───────────┐        │
│          │ question + options │  │ company-card          │        │
│          │ + keyboard hint    │  │ (name + detail items) │        │
│          └────────────────────┘  └───────────────────────┘        │
├───────────────────────────────────────────────────────────────────┤
│ footer (navy bar): 3 columns — tagline · disclaimer · links       │
└───────────────────────────────────────────────────────────────────┘
```

Modals (ELO chart, Year filter, Custom quiz builder) are fixed-position overlays toggled by a `.hidden` class.

**Responsive breakpoints:** `1024px` (quiz grid → single column), `768px` (header stacks, font 15px), `480px` (font 14px, full-width controls).

---

## 5. Components reference

| Component | Class | Notes |
|-----------|-------|-------|
| Primary button | `.btn .btn-primary` | Blue accent, white text, `scale(0.98)` on `:active` |
| Secondary button | `.btn .btn-secondary` | Neutral surface |
| Header filter buttons | `.btn-filter`, `.btn-apply` | Translucent white over navy; `.has-changes` pulses to signal unapplied filter edits |
| Answer option | `.option-btn` | Flex row: `.option-key` number badge + `.option-label`; gets `.correct`/`.incorrect` after answering |
| Company info | `.company-card` → `.detail-item` (`.detail-label` + `.detail-value`) | Icons are inline SVG with class `.detail-icon` |
| Stat cards | `.stat-card` (`.stat-value` + `.stat-label`) | Welcome screen metrics |
| Modal | `.modal` → `.modal-content` → `.modal-header` / `.modal-body` / `.modal-footer-actions` | `.hidden` toggles visibility |
| Filter chips | `.year-checkbox-item`, `.filter-checkbox-item` | Hidden checkbox + label; `:has(input:checked)` paints the chip with the accent colour |
| Keyboard hint | `.quiz-hint` + `kbd` | Hidden on coarse-pointer/touch devices |

Accessibility: a global `:focus-visible` ring (2px accent outline) appears only for keyboard navigation; a `prefers-reduced-motion` block neutralises animations/transitions.

---

## 6. JavaScript architecture (`assets/js/script.js`)

Plain functions over a single `gameState` object — no classes, no modules. Entry point is `initGame()`, fired on `DOMContentLoaded`.

```
initGame()
  ├─ loadEloHistory()   // restore ELO + history from localStorage
  ├─ initTheme()        // resolve & apply saved/system theme
  ├─ setupEventListeners()
  ├─ refreshIcons()     // render static lucide icons once
  └─ loadData()         // fetch + expand JSON, precompute filterOptions, hide loader
```

### 6.1 Quiz engine

`startQuiz → resetGame → generateNextQuestion → displayQuestion → selectAnswer → advanceToNext → (loop)`

- **`generateNextQuestion()`** picks a random company from `availableData`, chooses a question type (fixed category, or random of country/industry/region/year for "all"), and builds 4 options (correct + 3 distinct decoys drawn from the cached `filterOptions`, shuffled Fisher–Yates).
- **`displayQuestion()`** renders the company card (omitting the attribute being asked, and omitting country↔region together so neither spoils the other), then the numbered option buttons.
- **`selectAnswer()`** locks the buttons, marks correct/incorrect (compared via `dataset.value`, since button text now includes the number badge), updates counts + ELO, then arms a 1.5s auto-advance timer.
- **`advanceToNext()`** (timer, click outside, or Enter/Space) moves on.

### 6.2 ELO system

Config in `ELO_CONFIG`: start `800`, asymmetric K-factors — **+50** weighting on correct, **20** on incorrect — against a fixed expected score of `0.25` (a 4-option guess). So a correct answer ≈ `+38`, a wrong one ≈ `-5`: forgiving, mostly-rising. History (`{question, elo}` points) and current rating are persisted to `localStorage`. The graph is drawn manually on a `<canvas>` in `drawEloChart()` (axes, gridlines, line, points), re-rendered on theme change via a `MutationObserver` on `data-theme`.

### 6.3 Input model

- **Mouse/touch:** click an option; click anywhere (outside modals/links/buttons) to advance once an answer is shown.
- **Keyboard (`handleKeydown`):** `1`–`4` select an answer, `Enter`/`Space` start the quiz (on welcome) or advance to the next question. Ignored while typing in form fields or while a modal is open.

### 6.4 Modals & filters

Three modals share the `.modal`/`.hidden` pattern: **ELO chart**, **Year filter** (multi-select years), and **Custom quiz builder** (region/country/industry/year multi-select). Year and custom checkboxes are built once and cached (`yearCheckboxElements` map; custom lists rebuilt from cached `filterOptions`). The **Apply** button gets a `.has-changes` pulse whenever a filter is edited but not yet applied.

---

## 7. Performance design decisions

These are intentional and worth preserving on any rebuild:

1. **Data preload.** `<link rel="preload" as="fetch">` on `equities.json` starts the 20 MB download during HTML parse, in parallel with CSS/JS.
2. **Deferred scripts.** Lucide (pinned `@0.544.0`) and `script.js` both use `defer`, so neither blocks rendering; document order guarantees Lucide is defined before the app runs.
3. **Inline detail icons.** Company-card icons are emitted as static `<svg>` strings (`svgIcon()` + `DETAIL_ICONS`) instead of `<i data-lucide>`. This removes a full-document `lucide.createIcons()` scan that previously ran on **every** question.
4. **Precomputed filter options.** Distinct values are computed once at load; option generation and filter modals never re-scan 187k rows.
5. **Shared array references.** `filteredData`/`availableData` reference `data` (filters return fresh arrays and never mutate in place), avoiding repeated 187k-element copies.
6. **Cached DOM nodes.** Year checkbox elements are cached in a `Map` for O(1) read/write instead of `querySelectorAll`.
7. **Loop-based ELO min/max.** Avoids `Math.min(...spread)`, which can overflow the call stack once history grows large.
8. **Scoped transitions.** `body` only transitions `background-color`/`color` (not `all`), and `prefers-reduced-motion` is honoured.

---

## 8. How to rebuild from this blueprint

1. **Scaffold** `index.html`, `assets/css/style.css`, `assets/js/script.js`, `data/equities.json`. No tooling required.
2. **Drop in the theme tokens** from §4.1 on `:root` + `[data-theme="dark"]` + `[data-theme="black"]`. Wire a toggle that flips `data-theme` and persists to `localStorage`.
3. **Load Space Grotesk** (preconnect + `display=swap`) and set the `16/15/14px` responsive base.
4. **Build the shell:** navy header (logo + filters + ELO + theme), flex-centered main, 3-column navy footer.
5. **Data layer:** fetch the JSON, map short→expanded keys (keep the `COUNRTY` typo or rename everywhere), precompute `filterOptions`.
6. **Quiz engine:** the `generateNextQuestion → displayQuestion → selectAnswer → advanceToNext` loop from §6.1, hiding the asked attribute (and country↔region together).
7. **ELO:** asymmetric K-factors, `localStorage` persistence, manual canvas chart that redraws on theme change.
8. **Input:** number-key answers + click/Enter to advance.
9. **Modals:** ELO / Year / Custom, using the shared `.modal`/`.hidden` toggle and cached checkboxes.
10. **Polish:** `:focus-visible` ring, `prefers-reduced-motion`, preload the dataset, defer all scripts.

---

## 9. Known quirks / gotchas

- `COUNRTY` misspelling is intentional and pervasive (see §3).
- The "Pool" stat shows the size of the *current filtered question pool*, not questions remaining — the quiz is endless.
- The `black` theme and `system` theme exist in code but the visible toggle only cycles light/dark.
- The dataset must be served over HTTP (the `fetch` fails on `file://`).
- `equities.xlsx` is the source of truth for the data but is gitignored and never shipped.
</content>
</invoke>
