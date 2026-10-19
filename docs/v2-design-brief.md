# v2 design brief

Issue #3. This is the brief for the new UI variant, written before any v2 code. The route
structure it lands in (`app/(v2)`, served under `/v2/`, with a header switch to legacy) is
!11. Nothing here is implemented yet.

**Status:** draft. The product name is **pending the user's pick** (see [Name](#name)).
Until then, this document and the code say "v2". No candidate name goes into code, copy or
metadata before it is chosen.

## Decisions this brief builds on

Decided by the user on #3:

| # | Question | Decision |
|---|----------|----------|
| 1 | Sample documents | Keep the same four: `financial_report`, `legal_contract`, `technical_spec`, `source_code`. |
| 2 | Audience | Someone translating a real document, not a recruiter browsing a portfolio. |
| 3 | The one flow | Upload → translate → compare stays **simulated** in the hosted demo. It is not wired to the #4 engine. |
| 4 | Visual direction | **Rebrand.** PolyDoc stays as the original work, so v2 gets its own name and identity. |
| 5 | Empty hero | Left to this brief. Decided below: [drop target first](#the-empty-hero). |
| 6 | Variant link in `/app` | Yes. Done in !11. |

## What v2 must not reuse

PolyDoc is the legacy identity. v2 shares the translation logic and the sample files, but
none of the following:

- **Name and mark:** "PolyDoc"/"Polydoc", and the "P" mark in `lib/icons.tsx` (`PolydocIcon`,
  `#019DDC` blue and `#7B5AF5` violet).
- **Palette:** the sky-blue primary (`--primary: 202 99% 43%`), the 202-hue blue-grey
  neutrals, and the navy dark mode (`224 71.4% 4.1%`) in `app/(legacy)/globals.css`.
  Blue and violet stay out of the v2 palette entirely.
- **Type:** Inter (`lib/fonts.ts`).
- **Component look:** the stock shadcn look (0.5rem radius, ghost buttons, the
  `bordered-navigation-menu`) and the SaaS chrome: pricing, token meter, "Upgrade", account
  dropdown.
- **Copy:** the legacy hero headline and its typing animation, the "AI-powered translation
  for PDF, Word, and PowerPoint…" subtitle and footer text, and the "Seamlessly translate… /
  Break language barriers…" feature blurbs (`custom.json`, `marketing.json`). v2 copy goes
  in its own namespace (`public/locales/en/v2.json`).

## Audience and their job

**Who:** one person with one real document they need in another language. Examples: a
lease in Spanish, a product spec for a French supplier, a report for a colleague who reads
Chinese. They are not translators and not shopping for a SaaS plan. They usually have the
file open already.

**The job:** "Get this document into language X without wrecking the layout, and let me
check the result against the original before I send it."

**What they care about, in order:**

1. **Is my file safe?** Where it goes and who sees it. This is a stronger concern for
   contracts and reports.
2. **Will the layout survive?** Tables, headings and page breaks.
3. **Can I check it?** Side-by-side compare, page by page.
4. Speed and cost. These come last.

**Consequences for the design:**

- The first screen asks for the file. It is not a pitch.
- Privacy is stated in plain words, next to the drop target.
- The compare view is the payoff and gets the most space.
- There are no accounts, plans or dashboards in v2.

## The one flow: upload → translate → compare (simulated)

The hosted demo runs the whole flow in the browser, with no server. Its states follow the
#4 engine's shapes (`lib/translation/types.ts`, `translate-document.ts`):
`TranslationProgress` drives the progress UI and `TranslationErrorKind` drives the error
states. The same components can later run against a real `TranslationProvider` in the
desktop shell (#4 milestone 4) without being redesigned.

1. **Choose a document.** Drop a file on the page, or press the drop target (Enter or
   Space opens the file picker), or pick one of the four samples. Accepted types:
   `.pdf`, `.docx`, `.pptx`. Rejections reuse the #2 reasons (format, size, too many
   files), shown inline under the drop target. One file at a time: the audience has one
   document.
2. **Confirm the file.** A file card shows the name, type, page count and a first-page
   thumbnail rendered locally with react-pdf. For samples, the source language is known.
   For other files it reads "Detect automatically". Next to the card: "Your file stays in
   this browser tab."
3. **Pick the target language.** The four popular languages (`POPULAR_LANGUAGES`) appear as
   one-tap options, with a searchable list below them. For a sample, languages without a
   genuine translation in `SAMPLE_TRANSLATIONS` are disabled and say why. The demo never
   shows a translation in the wrong language.
4. **Translate.**
   - **Sample:** a progress strip shows "Section *n* of *N*", elapsed time and a token count,
     fed by a deterministic simulated `TranslationProgress` stream (about 3–5 s in total).
     There is a working **Cancel**, which aborts like `AbortSignal` does and returns to
     step 3. Progress is announced through an `aria-live="polite"` region.
   - **The visitor's own file:** the hosted demo cannot translate it, and it must not
     pretend to. The button reads **"Translate on your computer"**. It opens the
     run-locally panel (#4 CLI and, later, the desktop app), with the command already
     filled in with the file name. The file has still been rendered locally, so step 5's
     original pane works and the visitor can see what the compare view will look like.
5. **Compare.**
   - **Layout:** original on the left and translation on the right, with synced scroll, a
     page rail and a page counter. On narrow screens the two are tabs ("Original" /
     "Translation") with the page position kept when switching.
   - **Language markup:** each pane carries `lang`, and `dir="rtl"` for RTL targets.
   - **Actions:** **Download translation** (for samples, the PDF from `public/files`),
     **Try another language**, **Start over**.
6. **Errors.** One notice component with a title, one line of guidance and an optional
   copyable fix, mapped from `TranslationErrorKind`. The hosted demo mostly hits file
   rejections, and the desktop shell reuses the same component for provider errors.

Shareable state: `/v2/?sample=legal_contract&to=fr` opens a sample straight on step 5. This
is read client-side, so it works with the static export.

## The empty hero

**Decision: the drop target comes first, and the four samples sit inside it as one-click
"try a sample" entries. There is no auto-playing compare and no typing headline.**

The drop target fills most of the first viewport. Inside it:

- A short headline and one line of reassurance, in **draft copy** to be re-read with the
  chosen name:
  - "Drop a document. Read it in another language."
  - "PDF, Word or PowerPoint. The layout stays put, and the file never leaves this
    device."
- A **Choose a file** button, for people who don't drag and drop.
- A row of four sample tiles under a thin rule labelled "No file to hand? Try a sample":
  - **Financial report**
  - **Legal contract**
  - **Technical spec**
  - **Source code**

  Each tile shows a first-page thumbnail and its available languages as small codes
  (`EN ES FR IT`). One click runs steps 2–5 with that sample and its first non-source
  language.

**Why:**

- **It matches the job.** The audience arrives holding a file, so the most likely first
  action gets the most space. Legacy opens with a live sample compare below a long
  headline. That suits someone browsing a portfolio, not someone with a deadline.
- **The samples stay one click away.** They serve the two other real visitors: the one who
  wants to see the output before trusting the tool with a contract, and the one with no
  file to hand. Putting them inside the drop target, not in a separate section, keeps the
  page to a single decision.
- **It holds up in the desktop shell.** In the #4 shell the drop target performs a real
  translation, so the empty state needs no redesign when v2 runs there.
- **It is honest about the demo.** Leading with a pre-rendered compare would imply that
  the visitor's own file gets the same treatment in the hosted demo, which it does not
  (step 4).
- **It is cheaper.** No PDFs load until the visitor chooses something. Legacy loads two
  PDFs on first paint.

Rejected options:

- **Live sample compare as the hero.** This is the legacy pattern, and it is portfolio-first.
- **A short demo video or loop.** It costs bandwidth and motion, and the visitor can't use
  it.
- **A samples gallery with a separate upload section.** It splits the first decision in two.

## The samples

- **Files:** the same four from `public/files/<sample>/`, with `SAMPLE_TRANSLATIONS` as the
  single source of truth for which languages are genuine. v2 never lists the placeholder
  copies that `lib/sample-files.ts` excludes.
- **Labels:** plain names ("Legal contract"), not file names. File names appear only on
  the file card.
- **Uneven coverage:** `technical_spec` has only English, so its tile shows one language
  and the language step offers only that. Adding a language stays the existing process:
  render it with `scripts/sample-translations/render.sh` and list it. No v2-specific sample
  data.

## Information architecture for /v2

| URL | Content |
|-----|---------|
| `/v2/` | The tool: drop target with samples, then file, language, progress and compare on the same page. Steps change in place. Browser back steps back through them (history state). |
| `/v2/how-it-works/` | One page: how layout is kept (chunking with context carry-over, structure checks), what happens to files (nothing leaves the browser in the demo; local-only in the app), supported formats and languages. |
| `/v2/run-locally/` | The #4 setup in five minutes: CLI first, desktop app when it ships, Ollama or an API key. The same content the "Translate on your computer" panel shows. |

- **Header:**
  - wordmark (links to `/v2/`)
  - How it works
  - Run locally
  - the "Legacy UI" switch (from !11)
- **Footer:** one line with the name, a link to the source repository, and "Legacy UI".
- **Not in v2:** pricing, contact form, legal pages beyond a short privacy note on
  How it works, accounts, `/app`-style dashboards, token meters. A "Recent" list of the
  current session's results can live in a drawer if wanted later. It is not a page.

## Visual system

**Direction: "tracing paper on a desk".** The new identity uses three materials: warm
off-white paper, near-black ink, and one vermilion marker colour, the colour of a
proofreader's pencil and of the registration marks used when tracing. It is calm and
document-like: the documents are the content, and the interface stays quiet around them.

### Type

| Role | Font | Use |
|------|------|-----|
| Display | **Newsreader** (variable, `opsz`) | Hero headline, page titles. Weight 500–600, `opsz` auto, tracking −0.01em, `text-wrap: balance`. |
| UI and body | **Atkinson Hyperlegible Next** | Everything else. Built for legibility, which suits people reading carefully in a second language. |
| Data | **IBM Plex Mono** | File names, language codes, token counts, the CLI command. |

- **Loading:** fonts load with `next/font/google` in `app/(v2)/layout.tsx` only, so they
  never reach legacy.
- **Scale:** 1.25 ratio from a 16px base: 12.8 / 16 / 20 / 25 / 31.25 / 39 / 48.8px.
  Body line-height is 1.55, display 1.15.
- **Line length:** body text is capped at 68ch.

### Colour tokens

Hex values. The ratios are WCAG contrast against the page background. Tokens live on
`:root` in `app/(v2)/v2.css` as `--v2-*` custom properties.

| Token | Light | Dark | Use | Contrast (light / dark) |
|-------|-------|------|-----|------|
| `--v2-paper` | `#F6F4EF` | `#161512` | Page background | n/a |
| `--v2-surface` | `#FFFFFF` | `#1F1D19` | Cards, drop target, panels | n/a |
| `--v2-ink` | `#1A1A17` | `#EDEAE2` | Text, primary button fill | 15.9 / 15.2 |
| `--v2-ink-muted` | `#5C5A53` | `#A8A397` | Secondary text, captions | 6.3 / 7.3 |
| `--v2-rule` | `#DEDAD0` | `#34312A` | Hairlines and dividers (decorative only) | n/a |
| `--v2-field` | `#8A867B` | `#6E695E` | Input and drop-target borders | 3.3 / 3.3 (non-text ≥ 3) |
| `--v2-accent` | `#B93A1E` | `#F0835F` | Marks, focus ring, active step, links | 5.2 / 7.1 |
| `--v2-on-accent` | `#FFFFFF` | `#1A0D07` | Text on accent fills | 5.7 / 7.4 |
| `--v2-accent-wash` | `#F7E3DC` | `#3A2219` | Drop target hover and drag-over, selected language | accent text on it: 4.6 |
| `--v2-success` | `#2F6B3A` | `#7CC18A` | "Translation ready" | 5.8 / 8.6 |
| `--v2-danger` | `#9B1C1C` | `#F87171` | Errors, always with an icon and a title | 7.4 / 6.6 |

Rules:

- **Accent use:** the accent covers at most about 5% of any screen: marks, the focus ring,
  the active step, the one primary emphasis.
- **Primary button:** ink fill with paper text. It is not accent-filled.
- **Accent vs danger:** both are reddish, so danger never appears without its icon and a
  title, and it is never the accent's job to signal an error.
- **Document pages:** rendered PDF pages stay white in both themes (they are the user's
  document). In dark mode they sit on `--v2-surface` with a 1px `--v2-rule` frame instead
  of a shadow.

### Spacing, radius and elevation

- **Spacing:** 4px base. The scale is 4, 8, 12, 16, 24, 32, 48, 64, 96. Section gaps are 64–96,
  component padding 12–24.
- **Layout:** one centred column of up to 72rem. The compare view breaks out to full width
  minus a 24px gutter, with 16px on phones.
- **Radius:**
  - 2px: document thumbnails and pages (paper has square corners).
  - 6px: buttons, inputs and language options.
  - 12px: the drop target and panels.
  - No pill shapes, except language codes.
- **Elevation:** a single "paper" shadow, `0 1px 2px rgb(26 26 23 / .06), 0 8px 24px -12px
  rgb(26 26 23 / .18)`, used on document pages and the file card only. Everything else is
  flat, separated by rules.

### Components

| Component | Notes |
|-----------|-------|
| `DropTarget` | 12px radius, 1.5px dashed `--v2-field` border. On drag-over: solid accent border and `--v2-accent-wash` fill. Keyboard-operable (`role="button"`, Enter/Space). Holds the headline, the reassurance line, "Choose a file" and the sample row. |
| `SampleTile` | Thumbnail (2px radius, paper shadow), plain-name label, language codes in Plex Mono. The whole tile is the button. |
| `FileCard` | Thumbnail, name (mono), type and pages, source language, "Change file". |
| `LanguagePicker` | The four popular languages as a segmented group, then a searchable listbox (combobox pattern). Disabled options carry a reason. |
| `ProgressStrip` | Thin 4px bar plus the text "Section 3 of 8 · 0:04 · 1,240 tokens", and Cancel. |
| `CompareView` | Two `PageFrame` columns, synced scroll, page rail, counter. Tabs below 768px. |
| `PageFrame` | Wraps a react-pdf page with the paper treatment. Lazy-renders pages near the viewport. |
| `Notice` | Info, success and danger variants. Icon, title, one line of guidance, optional copyable fix. |
| `Button` | Primary (ink fill), secondary (surface with a field border), quiet (text, accent underline on hover). 40px tall, 44px tap target on touch. |
| `RunLocallyPanel` | Mono command block with a copy button, then steps. Shared by the panel and `/v2/run-locally/`. |
| `SiteHeader` / `SiteFooter` | Hairline-ruled. The wordmark sits left, links right, and the variant switch is last. |

- **Icons:** lucide, at 1.5px stroke, 18/20px. SVG only, no emoji (the legacy language list
  uses flag emoji, and v2 shows language names and codes instead).

### Motion

- **Durations:** 120–220ms, `cubic-bezier(.2, .7, .2, 1)`. Motion only confirms a change of
  state: drag-over, a step changing in place (a 150ms crossfade plus 8px rise), progress
  filling, and the compare panes settling.
- **Not in v2:** typing text, looping decoration, parallax, scroll-triggered reveals, or
  animated gradients.
- **What animates:** only `opacity` and `transform`. The progress bar uses `scaleX`.
- **`prefers-reduced-motion`:** every transition becomes an instant state change. Progress
  still updates as text.

### Dark mode

- **Default:** follows `prefers-color-scheme`. The header has a manual toggle stored per
  viewer. Implement it with `data-theme` on `<html>` and the same tokens (no `next-themes`
  dependency is needed for v2).
- **Look:** dark mode is "desk lamp": warm near-black, not navy.
- **Accent and pages:** the accent lightens to `#F0835F`, and document pages stay white
  (see Colour tokens).

### Accessibility

- **Target:** WCAG 2.2 AA. All text pairs above meet 4.5:1, and field borders and focus
  meet 3:1.
- **Focus:** a visible 2px `--v2-accent` ring with a 2px offset on every interactive
  element. No `outline: none` without a replacement.
- **Drop target:** fully usable without drag and drop. It has a labelled button, and the
  hidden file input is reachable.
- **Progress and results:** announced in an `aria-live="polite"` region. "Translation
  ready" moves focus to the compare view heading.
- **Compare panes:**
  - each has `lang` set, plus `dir="rtl"` for RTL targets
  - page images have text alternatives ("Page 3 of 8, original")
  - PDF text layers stay selectable
- **Target sizes:** at least 24×24px, and 44px on touch layouts.
- **Errors:** never conveyed by colour alone. Each has an icon, a title and text.

### Copy tone

Plain, direct and second person. Short sentences. No hype ("seamless", "AI-powered",
"break barriers"). State limits honestly: "This demo shows sample translations. Your own
file is translated on your computer." Every string lives in `public/locales/en/v2.json`.

## Name

**Pending the user's pick.** Candidates are below, with the recommendation first. None has
been trademark- or domain-checked yet. Check that before choosing.

| Candidate | Rationale |
|-----------|-----------|
| **Calque** (recommended) | Two meanings that both fit: in linguistics, a *calque* is a loan translation (a phrase carried word for word into another language), and in French *calquer* means "to trace". A translation that traces the original's layout is what the product does. It is short and easy to say in the main target languages, and it shares nothing with "PolyDoc". |
| **Facing** | From "facing pages": bilingual editions print the original and the translation on facing pages, which is the compare view. It is quiet and literary, but it is a common English word and harder to own as a name. |
| **Interlinear** | An interlinear text puts the translation between the lines of the original. It is precise for checking a translation against its source, but long, and a little academic for the audience. |
| **Twinleaf** | Two leaves, one document: original and translation as a pair. Friendly and easy to picture, but less tied to translation itself. |

**Logo and wordmark direction (for Calque):**

- **Mark:** two page outlines, square-cornered, offset by a few pixels diagonally. The back
  one is solid ink, and the front one is a translucent "tracing paper" sheet drawn as an
  outline over it. A small vermilion registration tick sits at the top-left corner where
  the two meet. It works as a one-colour favicon (outline pages only) at 16px.
- **Wordmark:** lowercase "calque" in Newsreader at a medium weight, with tight but not
  touching letterspacing. The only flourish is that the descender of the "q" ends in a
  short horizontal stroke, like a tracing line, in the accent colour. It is ink on paper
  in both themes.
- **No** gradients, no blue or violet, and no "P"-style letter mark, which keeps it clear
  of the legacy mark.

The same construction (two offset sheets plus one vermilion mark) adapts to the other
candidates if one of them is chosen. For example, Facing becomes two sheets side by side,
not offset.

## Implementation notes (for the MR that follows)

- **Location:** everything lives in `app/(v2)` (!11). Logic is reused, components are
  not:
  - reused: `lib/sample-files.ts`, `lib/translation/*` types, `react-dropzone`, `react-pdf`
  - not imported: legacy UI components (`components/shadcn`, `components/header`, the
    hero)
- **Styling:** CSS custom properties in `v2.css`, plus CSS Modules per component. This
  keeps v2 off the legacy Tailwind theme, whose colour utilities resolve to legacy
  variables. If Tailwind is wanted later, give v2 its own `--v2-*`-mapped theme section
  rather than the shared `background`/`primary` names.
- **i18n:** a small client provider in the v2 layout loading only `v2.json` (and
  `marketing.json` for the switch label).
- **The simulator:** a pure function `simulateTranslation(sample, lang, { signal,
  onProgress })` returning a `TranslateDocumentResult`-shaped value, so swapping in the
  real `translateDocument` later is a one-line change in the desktop shell.
- **Acceptance (from #3):** v2 passes the hero Playwright checks that apply:
  - the drop target rejects unsupported files with the #2 messages
  - every sample/language pair that `SAMPLE_TRANSLATIONS` lists loads
  - no page errors
