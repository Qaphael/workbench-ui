# Checklists, commands, and the definition of done

**Contents**

1. [Per-phase checklists](#1-per-phase-checklists)
2. [Commands by stack](#2-commands-by-stack)
3. [The test matrix](#3-the-test-matrix)
3a. [Promoted rule checks](#3a-promoted-rule-checks)
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
- [ ] **Chrome budget**: the header has ≤ 8 interactive controls at 1024 px and
      does not wrap or cause horizontal page scroll.
- [ ] **Panel disclosure**: primary panels show controls, not prose; a selected
      state has zero instructional paragraphs.
- [ ] **Actions are offered only when runnable** (Align from two selected,
      Distribute from three; no permanently disabled action).
- [ ] **One baseline per control row**: every control in a filter row has the
      same height and every label the same line box.
- [ ] **Panel scrolling**: the body scrolls, the card and footer do not.
- [ ] **Headings are sentence case**; caps is used only for field labels.
- [ ] **Scrim** is a token, sampled as a rendered pixel in both themes.
- [ ] **One modal stack**: Escape closes only the top-most; global shortcuts are
      inert behind a dialog; shortcut scope follows the focused target.
- [ ] **Direct-manipulation surface owns the keyboard**: focus on pointerdown,
      Space-drag pans with a button focused, blur releases the modifier.

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
| Chrome density | header control count at 1024 px · no horizontal page scroll |
| Panel disclosure | zero hint paragraphs in the panel's primary state · hidden (not disabled) actions |
| Control rows | measured equal heights and one label baseline |
| Modal/keyboard | focus spec · shortcut spec · canvas keyboard spec |
| Scrim / danger / control roles | token test (roles exist, dark danger is neutral, scrim 40% light / 65% dark, contrast) |
| Backend untouched | the backend suite still runs before release |

**Visual regression policy**

- Screenshots are expected to change during the pilot and polish phases.
- Update baselines deliberately, one screen at a time.
- A screenshot diff in the **light** theme must be structural only. If a colour
  hue changed, that is a bug until someone explicitly approves it.
- Screenshots are captured in **both** themes. A redesign nobody looked at in
  dark mode is a redesign with an untested half.

---

## 3a. Promoted rule checks

Each rule in `design-language.md` has a check that fails without it. Run these
against the target app, not against this skill.

| Rule | Check |
|---|---|
| Chrome budget | At 1024 px: `await page.locator('header button, header a[href], header input, header select, header [role="button"]').count()` ≤ 8, and `scrollWidth <= innerWidth` on `documentElement`. |
| A view replaces, a dialog covers | Navigate design → run → history: at each step exactly one `[data-view]` is in the DOM and `[role="dialog"]` is absent. A deep link to an empty view lands on start. |
| Divider is invisible until interactive | Computed `background-color` of `.split-handle::before` is transparent at rest and non-transparent on hover/focus/`[data-dragging="true"]`. |
| One baseline per control row | Every control in the filter row has the same `getBoundingClientRect().height`; every label has the same `line-height`. |
| Panel body scrolls, card does not | `body.scrollHeight > body.clientHeight`; `card.scrollHeight === card.clientHeight`; footer's `flex` resolves to `0 0 auto`. |
| Disclose only runnable actions | With 1 item selected, the align action is absent; with 2 it is present; with 3 the distribute action is present. No `button:disabled` whose only blocker is the selection count. |
| A panel shows controls, not prose | `panel.locator('.hint, .inspector-hint, p')` has count 0 in the panel's primary state; the explanations are `title` attributes on the controls. |
| Headings are sentence case | Computed style of a card/section title: `text-transform: none`, `letter-spacing: 0px`, `font-size: 13px`, `font-weight: 600`. |
| Status is words plus a tint | Every badge has a non-empty text node; its background is a tint of its own `color` (sample the pixel twice with different statuses). |
| Sortable table headers | `<th aria-sort>` updates on Enter and Space; the header is focusable; the range cells wrap rather than ellipsis. |
| One modal stack | With two dialogs open, Escape closes one; `Ctrl+Z`/`Ctrl+S` behind a dialog do nothing. |
| Shortcut scoping | Typing in a text field keeps its keys; a `<select>` keeps arrows; `Ctrl+Z` works while a `<select>` is focused; a dialog blocks all. |
| Direct-manipulation keyboard | Focus a toolbar button → Space-drag pans. Click Delete → Space does not delete. Alt-tab while holding Space → release → no stuck pan. |
| Scrim | Token test asserts `40%` light / `65%` dark; e2e samples the paper through the veil: ≈255 → 153 (light) and ≈89 (dark). |
| Danger roles | Token test: dark `--color-button-danger` resolves to `--color-button-2`, dark text resolves to `--color-danger`; both fills clear 4.5:1 with their text. |
| Control fill | Token test: dark `--color-control` is lighter than `--color-panel-2`; `--color-field`, `--color-button-2` and `--color-seg-active` all resolve to it. |

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
- [ ] Status is never colour-only: words plus a tint.
- [ ] Sortable headers expose `aria-sort` and sort on Enter/Space.
- [ ] One modal stack: Escape closes only the top-most; global shortcuts are
      inert while a modal is open.
- [ ] Shortcut scope follows the focused target (text field, dialog, select,
      elsewhere).
- [ ] A direct-manipulation surface takes focus on pointerdown; Space is a held
      modifier; blur releases it.
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
