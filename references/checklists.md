# Checklists, commands, and the definition of done

**Contents**

1. [Per-phase checklists](#1-per-phase-checklists)
2. [Commands by stack](#2-commands-by-stack)
3. [The test matrix](#3-the-test-matrix)
4. [Accessibility checklist](#4-accessibility-checklist)
5. [The definition of done](#5-the-definition-of-done)
6. [The report format](#6-the-report-format)

---

## 1. Per-phase checklists

### Phase 0 — Baseline

- [ ] Full suite run; the **numbers** recorded (backend / unit / e2e counts).
- [ ] Current light palette recorded, value by value.
- [ ] Built CSS hashed; the hash stored.
- [ ] Structural problems recorded (component lines, stylesheet lines, raw
      control counts, fixed-width panes).
- [ ] Pre-existing flakiness diagnosed and noted.

### Phase 1 — Tokens

- [ ] Token stylesheet added; light values replaced with the app's real ones.
- [ ] Colour lint added, **in the same commit**.
- [ ] Frozen-palette test added, **in the same commit**.
- [ ] Dark theme: the three resolution blocks, identical to each other.
- [ ] Pre-paint theme script installed and the entry document set to
      `Cache-Control: no-store`.
- [ ] Chrome roles added, resolving light to today's values.
- [ ] Verified: light fingerprint unchanged · dark blocks identical · luminance
      ordering · contrast ≥ 4.5:1 · lint passes.

### Phase 2 — Shell

- [ ] Window frame: mat, padding, one rounded outline.
- [ ] `--gutter`, `--radius-card`, `--shadow-card`.
- [ ] Chrome roles applied.
- [ ] Pure resize maths + unit tests.
- [ ] Splitter: pointer capture, double-click reset, arrow keys, Shift step,
      full ARIA, persisted widths.
- [ ] Fixed-width panes converted.
- [ ] Verified: light unchanged · measured width = visible card edge · keyboard
      works.

### Phase 3 — Primitives

- [ ] The eleven primitives added.
- [ ] Each renders a shared class; no primitive-local styling.
- [ ] The primitives README written.
- [ ] Dev gallery added and compiled out of production.
- [ ] Gallery e2e spec: screenshots + axe, both themes.
- [ ] Verified: build clean · gallery absent from the production bundle.

### Phase 4/5 — Pilot and expand

Per screen:

- [ ] Migrated to the primitives.
- [ ] Card treatment + shell pattern applied.
- [ ] Loading, empty, error, dirty, disabled states all explicit.
- [ ] Empty state: short heading, one sentence, one primary action.
- [ ] Disabled states readable (flat fill + muted text).
- [ ] axe in both themes; screenshots in both themes; existing e2e specs pass.

### Phase 6 — Polish

- [ ] Chrome quieted; one filled accent per group; one filled button per view.
- [ ] Floating chrome moved into the frame.
- [ ] Empty states consistent.
- [ ] `prefers-reduced-motion` handled.
- [ ] `prefers-contrast` handled.
- [ ] Focus ring on the control, not an inner element.

### Phase 7 — Refactor

- [ ] God components split into hooks / feature folders.
- [ ] Stylesheet split into ordered feature files.
- [ ] **Built CSS hash unchanged.**
- [ ] Full unit suite, full e2e suite, build — all green.

### Phase 8 — QA

- [ ] axe in both themes, every screen.
- [ ] Screenshots captured and reviewed in both themes.
- [ ] Light diffs structural only.
- [ ] Docs updated (instructions file, README, platform test plan).
- [ ] Packaged build verified or explicitly listed as needing verification.
- [ ] Plan checklist and progress log up to date.

---

## 2. Commands by stack

### Node + TypeScript (Vite / React / any framework)

```bash
npm test                       # unit tests (vitest / jest)
npm run build                 # typecheck + production build
npm run lint:colors           # the colour lint
npm run test:e2e              # Playwright
npm run test:e2e -- theme.spec.ts a11y.spec.ts    # targeted
```

### Plain CSS / no build step

```bash
node scripts/lint-colors.mjs --src src --tokens src/styles/tokens.css
node scripts/contrast-check.mjs --tokens src/styles/tokens.css
```

### Python backend (only needed if the UI work touched the API)

```bash
python -m pytest -q
```

### Hashing the built CSS

```bash
# Linux / macOS
sha256sum frontend/dist/assets/*.css

# Windows
certutil -hashfile frontend\dist\assets\index.css SHA256

# macOS
shasum -a 256 frontend/dist/assets/*.css
```

### Token linting on every commit

```json
{
  "scripts": {
    "lint:colors": "node scripts/lint-colors.mjs",
    "verify": "npm run lint:colors && npm test && npm run build"
  }
}
```

---

## 3. The test matrix

| Change | Minimum checks |
|---|---|
| Dark tokens | unit tests · build · colour lint · theme spec · a11y spec |
| Split panes | splitter unit tests · layout spec · build |
| UI primitives | unit tests · build · targeted e2e for affected screens |
| Screen N | that screen's e2e specs · theme spec · a11y spec |
| App/CSS refactor | full unit suite · full e2e suite · build |
| Backend untouched | the backend suite still runs before release |

**Visual regression policy**

- Screenshots are expected to change during the pilot and polish phases.
- Update baselines deliberately, one screen at a time.
- A screenshot diff in the **light** theme must be structural only. If a colour
  hue changed, that is a bug until someone explicitly approves it.
- Screenshots are captured in **both** themes. A redesign nobody looked at in
  dark mode is a redesign with an untested half.

---

## 4. Accessibility checklist

- [ ] Every interactive control has an accessible name.
- [ ] One focus treatment everywhere: `outline: 2px solid var(--color-selection)`
      with a matching offset.
- [ ] The focus ring is on the control, not on an inner element.
- [ ] Body and muted text ≥ 4.5:1 on every surface, **both** themes.
- [ ] Semantic colours (danger/success/warning) ≥ 4.5:1 on panel and canvas.
- [ ] Disabled controls are **readable** — flat fill + muted text, not a faded
      opacity.
- [ ] Every drag has a keyboard equivalent.
- [ ] Every tab list has arrow-key navigation and a roving tabindex.
- [ ] Every modal traps focus, closes on Escape, and restores focus.
- [ ] Separators expose `role="separator"` + the full `aria-value*` set.
- [ ] Targets ≥ 32 px; ≥ 44 px on coarse-pointer surfaces.
- [ ] `prefers-reduced-motion` collapses animation.
- [ ] `prefers-contrast` strengthens borders and the focus ring.
- [ ] axe passes in both themes, on every screen and the primitive gallery.

---

## 5. The definition of done

- [ ] The resizable shell works in every view that needs it, with persisted
      widths, keyboard support, min/max, and double-click reset.
- [ ] Dark mode matches the low-chrome direction.
- [ ] **Light mode colours are unchanged.**
- [ ] Every screen shares the same visual language.
- [ ] Repeated UI patterns use primitives where justified.
- [ ] The main components are smaller and easier to navigate.
- [ ] All automated tests pass; axe passes in both themes.
- [ ] Light/dark screenshots are captured and reviewed.
- [ ] The instructions file, README and platform test plan are updated.
- [ ] The packaged build is verified or explicitly listed as needing
      verification.
- [ ] The plan checklist and progress log are up to date.

---

## 6. The report format

End every session with:

```text
What changed
  - <file>: <one line>
  - <file>: <one line>

Evidence
  - <the exact command and its real output, trimmed>

Needs <platform> verification
  - <list>

Known gaps / follow-ups
  - <list>
```

Rules for the evidence section:

- **Paste the real output.** Trim it, but do not paraphrase it. "Tests pass" is
  not evidence; "398 passed in 42.10s" is.
- **Name what you did not run.** If the e2e suite was blocked on this machine,
  say so and say why.
- **Never claim something works unless you ran it.** A phrase like "should
  work" in an evidence list is a bug in the report.

The "needs verification" section is not an excuse — it is a handover note. It
is how the next person (or the next machine) knows exactly where to pick up.
