# The workbench design language — concrete spec

Everything here is a value you can copy. `assets/tokens.css` is the
ready-to-paste version of the token layer; this document is the *reasoning*
behind those values and the CSS that applies them.

**Contents**

1. [Colour codes](#1-colour-codes)
2. [The window frame](#2-the-window-frame)
3. [The gutter system](#3-the-gutter-system)
4. [Cards and panels](#4-cards-and-panels)
5. [Chrome roles](#5-chrome-roles)
6. [The design-view layout grid](#6-the-design-view-layout-grid)
7. [The chrome fillet](#7-the-chrome-fillet)
8. [Dark theme](#8-dark-theme)
9. [Type, spacing, radii](#9-type-spacing-radii)
10. [Accessibility rules](#10-accessibility-rules)
11. [The primitives contract](#11-the-primitives-contract)
12. [Direct-manipulation surfaces](#12-direct-manipulation-surfaces)

---

## 1. Colour codes

### Light (frozen — never edit to satisfy dark)

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#eceee9` | app background, the mat around the window frame |
| `--color-panel` | `#fbfbf8` | raised card / panel surface |
| `--color-panel-2` | `#f0f1ec` | one step down: tracks, segmented backgrounds, hover |
| `--color-canvas` | `#d9dcd4` | the well the work sits in |
| `--color-bg-hover` | `#e3e6de` | hover fill on rows and buttons |
| `--color-border` | `#d5d8d0` | hairline |
| `--color-border-strong` | `#b4baac` | hairline on hover |
| `--color-text` | `#1f2430` | body text |
| `--color-muted` | `#5c6472` | secondary text (≥ 4.5:1 on every surface) |
| `--color-primary` | `#26324d` | brand navy; the one filled accent |
| `--color-on-primary` | `#ffffff` | text/icon on the primary fill |
| `--color-selection` | `#2f5bd6` | focus ring + selection ring |
| `--color-danger` | `#c8321f` | destructive actions |
| `--color-success` | `#17794f` | positive states |
| `--color-warning` | `#7a5400` | readable amber on light |
| `--color-primary-tint` | `#e3e8f3` | tinted chips |
| `--color-warning-tint` | `#f7ecd6` | tinted chips |

### Ink — identical in both themes

| Token | Hex | Why it is theme-independent |
|---|---|---|
| `--color-paper` | `#ffffff` | a printed page must not darken |
| `--color-stamp` | `#d00000` | the stamp keeps its ink on screen and on paper |
| `--color-brand` | `#26324d` | the logo reads the same everywhere |

### Editor overlays (on the white page)

| Token | Hex |
|---|---|
| `--color-guide` | `#0097a7` |
| `--color-guide-active` | `#ff2d95` |
| `--color-spacing` | `#ff8a00` |
| `--color-overlay` / `--color-on-overlay` | `#000000` / `#ffffff` |
| `--color-slot-box` | `#26324d` |
| `--color-slot-selected` | `#2f5bd6` |

### Dark (layered charcoal)

| Token | Hex | Light equivalent |
|---|---|---|
| `--color-canvas` | `#000000` | `#d9dcd4` |
| `--color-bg` | `#111111` | `#eceee9` |
| `--color-panel` | `#181818` | `#fbfbf8` |
| `--color-panel-2` | `#202020` | `#f0f1ec` |
| `--color-bg-hover` | `#242424` | `#e3e6de` |
| `--color-border` | `#2c2c2c` | `#d5d8d0` |
| `--color-border-strong` | `#3d3d3d` | `#b4baac` |
| `--color-text` | `#f2f2f2` | `#1f2430` |
| `--color-muted` | `#a6a6a6` | `#5c6472` |
| `--color-primary` | `#8fa8ff` | `#26324d` |
| `--color-on-primary` | `#10141c` | `#ffffff` |
| `--color-selection` | `#6f95ff` | `#2f5bd6` |
| `--color-danger` | `#ff7a63` | `#c8321f` |
| `--color-success` | `#4cc38a` | `#17794f` |
| `--color-warning` | `#e0b050` | `#7a5400` |
| `--color-primary-tint` | `#1e2433` | `#e3e8f3` |
| `--color-warning-tint` | `#2e281e` | `#f7ecd6` |

**Do not copy these into a brownfield app.** A brownfield app keeps its own
light palette (frozen) and gets a dark palette derived from its own brand. The
table above is the *shape* of a good dark palette — layered charcoal, the ink
tokens exempt — and a worked example.

---

## 2. The window frame

The whole window is one rounded frame. The body paints the mat, the `.app`
fills the rest, and the header and status bar clip to the same soft outline.

```css
body {
  /* The window's mat: the app shell is a rounded card floating on it. */
  background: var(--color-canvas);
  padding: var(--gutter);
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg);
  /* One rounded frame for the whole shell; the header and status bar clip to
     it, so the window's four corners are soft in both themes. */
  border-radius: var(--radius-card);
}
```

The frame is **borderless**. There is no `border` on `.app`, no rule under the
header, no border on the tool rail. Hierarchy comes from surface contrast:

```
┌─────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░  the mat (--color-canvas), 6px all round  ░░░░░  │
│  ░┌───────────────────────────────────────────────────────────┐░ │
│  ░│  header            --color-shell, no bottom rule         │░ │
│  ░│ ┌────┬─────────────────────────────┬────────────────────┐│░ │
│  ░│ │rail│  canvas card                 │ inspector card     ││░ │
│  ░│ │    │  (--color-panel, radius-card) │ (::before pseudo) ││░ │
│  ░│ │    │                             │                    ││░ │
│  ░│ │    │  gutter │ splitter │ gutter  │                    ││░ │
│  ░│ └────┴─────────────────────────────┴────────────────────┘│░ │
│  ░│  status bar        --color-shell, no top rule           │░ │
│  ░└───────────────────────────────────────────────────────────┘░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────────────────────────┘
```

Note the two things that are easy to get wrong:

- **The mat is `--color-canvas`, not `--color-bg`.** The canvas colour is the
  darkest/most recessed surface, which is where the content lives; the mat
  around the frame should match the app's ground, not the well.
- **The frame's radius is `--radius-card`**, the same as every card inside it.
  One radius for the frame and the cards is what makes the app look designed
  rather than assembled.

### A view replaces; a dialog covers

A workflow view is a full workspace, not a layer. Switching steps swaps the view
in place; it must not leave the previous view mounted underneath, because that
view's keyboard handlers are still aimed at something the user cannot see. Only
dialogs are modals, and a dialog is the one thing allowed to cover a view.

Two consequences follow:

- **The router is part of the shell contract.** A deep link to a view with
  nothing loaded falls back to the start view, never to a blank workspace.
- **Shortcuts belong to the active view, not the window.** If the editor is not
  on screen, its Delete/arrow/tool keys must not fire (see §10).

---

## 3. The gutter system

`--gutter: 6px` is the single most load-bearing number in the layout.

```css
:root {
  --gutter: 6px;                  /* the gap between the shell edge and a card */
  --radius-card: var(--radius-md);
  --shadow-card: var(--shadow-md);
}
```

The gutter is used for **four** distinct jobs, and it is the same 6px in all of
them:

| Where | How |
|---|---|
| body → frame | `body { padding: var(--gutter) }` |
| frame edge → card | `margin: var(--gutter)` on the card, or `padding: var(--gutter)` on the pane with the card drawn by `::before` |
| card → card | the same margin, when two cards sit side by side |
| splitter column | the splitter column **is** the gutter — the visible gap is exactly the divider's width |

That last row is the subtle one. A draggable divider is 6px wide, and the card
beside it is inset by 6px, so the visible gap between the canvas card and the
inspector card is the divider itself. You get a clean gutter for free from a
component you already needed.

```css
.design-view {
  grid-template-columns: var(--rail-width) minmax(0, 1fr) 6px
    var(--inspector-width, 320px);
  /*                ^ the splitter column IS the gutter        */
}

.design-view > .split-handle {
  grid-column: 3;
  /* Match the card's vertical inset so the divider sits in the gap, not
     alongside the shell edges. */
  margin: var(--gutter) 0;
}
```

**A divider is invisible until it is interactive.** The gutter already separates
the cards; a permanent rule adds noise and makes the workspace look boxed in.
Draw the splitter as a transparent hairline that appears on hover, focus and
drag:

```css
.split-handle::before {
  background: transparent;
}
.split-handle:hover::before,
.split-handle:focus-visible::before,
.split-handle[data-dragging="true"]::before {
  background: var(--color-border-strong);
}
```

---

## 4. Cards and panels

One geometry for every card in the app: `--gutter` inset, `--radius-card`
corners, `--shadow-card` elevation.

```css
:root {
  --gutter: 6px;
  --radius-card: var(--radius-md);   /* 8px */
  --shadow-card: var(--shadow-md);   /* none in dark */
}
```

### The card

```css
.design-canvas {
  margin: var(--gutter) 0 var(--gutter) var(--gutter);
  background: var(--color-panel);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
```

### The card that must not change a measured width

When a pane's width is contractual — a draggable splitter measures it and
persists it — the card must be *drawn* without changing the pane's box. Put the
surface on a pseudo-element behind the content:

```css
.inspector {
  position: relative;
  z-index: 0;
  padding: var(--gutter) var(--gutter) var(--gutter) 0;
  background: transparent;   /* the pane is not the card */
  overflow: visible;
}

.inspector::before {
  content: "";
  position: absolute;
  /* The 6px splitter column is the left gutter, so the card starts flush with
     the pane and the visible gap is exactly the splitter's width. */
  inset: var(--gutter) var(--gutter) var(--gutter) 0;
  z-index: -1;
  background: var(--color-panel);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
```

**Why this matters:** if the card's border and padding lived on `.inspector`
itself, the pane would measure 320px *including* the card's chrome, so the
visible card edge would sit at 314px and the splitter would be dragging a
boundary the user cannot see. The pseudo-element keeps the measured width and
the visible card edge identical.

### Panels (a card with a heading)

```css
.ui-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ui-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.ui-panel-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  min-width: 0;
}
```

### Bottom chrome is chrome, not a card

A status bar, a transport bar, a scrubber — these belong to the frame. They get
the shell surface and **no top rule**:

```css
.status-bar {
  background: var(--color-shell);
  border-top: 0;
  font-size: var(--font-size-xs);
  color: var(--color-muted);
}
```

### Scrolling belongs to the body, not the card

A panel is a fixed card with a scrolling body. The card never scrolls and the
footer never scrolls; the body does. If the whole card scrolls, its rounded
corners and its footer drift while the content moves, and focusing a control can
scroll the card out from under its own heading.

```css
.panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.panel-body {
  flex: 1 1 auto;
  min-height: 0;    /* without this, flex children refuse to shrink */
  overflow: auto;
}
.panel-footer {
  flex: 0 0 auto;   /* the footer can never be squeezed by the scrolling body */
}
```

### One baseline per control row

Native controls have different intrinsic heights — a date input, a select and a
text input are rarely equal, and their labels inherit three different line
boxes. A row of filters must give every control the same height and every label
the same line box; otherwise the row reads as a jagged accident even when the
gaps are perfect.

```css
.filter-row > .input,
.filter-row > .select,
.filter-row > .date-control {
  height: 32px;
}
.filter-row > label {
  line-height: 16px;
}
```

Keep this a row-level rule, not a global input height: a search field in a
toolbar and a textarea in a form have different jobs.

---

## 5. Chrome roles

The indirections that make theming cheap.

| Role token | Light | Dark | Applied to |
|---|---|---|---|
| `--color-shell` | `panel` | `bg` | header, tool rail, status bar |
| `--color-control` | `panel-2` | `#262626` | the one fill shared by fields, secondary buttons and the active segment |
| `--color-control-hover` | `bg-hover` | `#303030` | hover for every filled control |
| `--color-field` | `panel` | `control` | inputs, selects |
| `--color-field-border` | `border` | `transparent` | …the border that comes back on hover |
| `--color-button-2` | `panel-2` | `control` | secondary buttons |
| `--color-button-2-border` | `border` | `transparent` | |
| `--color-seg` | `panel-2` | `bg` | segmented control track |
| `--color-seg-border` | `border` | `transparent` | |
| `--color-seg-active` | `panel` | `control` | the active segment |
| `--color-button-danger` | `danger` | `button-2` | a destructive action inside a working panel |
| `--color-button-danger-text` | `on-primary` | `danger` | its text and icon |
| `--color-scrollbar-thumb` | `muted` | `control` | the scrollbar thumb |
| `--scrim` | `40% overlay` | `65% overlay` | the dialog veil |
| `--shadow-card` | `--shadow-md` | `none` | every card |

The payoff is measurable: **these roles are referenced in five places.** In
light they resolve to bordered, flat surfaces — the app's existing look. In
dark they resolve to filled, borderless controls with the border returning on
hover and focus. Switching the entire control character of the app between
themes touched **no component**.

```css
/* the ONLY places the roles are used */
.btn-secondary { background: var(--color-button-2); border-color: var(--color-button-2-border); }
.btn-secondary:hover:not(:disabled) { background: var(--color-button-2-hover); border-color: var(--color-button-2-hover-border); }
.input, .select { background: var(--color-field); border: 1px solid var(--color-field-border); }
.input:hover, .select:hover:not(:disabled) { border-color: var(--color-field-border-hover); }
.seg { background: var(--color-seg); border: 1px solid var(--color-seg-border); }
.seg button.on { background: var(--color-seg-active); }
```

### The one filled accent per group

A filled `primary` tile means *active*, not *primary action*. The rule:
**if two things in a view are filled with `--color-primary`, one of them is
wrong.** The filled primary *button* is the view's one primary action.

```css
.tool-rail-button.on {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.tool-rail-button.on:hover { background: var(--color-primary); color: var(--color-on-primary); filter: brightness(1.08); }
```

### A dangerous action is not a second primary

A Delete inside a working panel must not compete with the view's one primary
action. In light the app's existing language can keep the filled red. In dark a
filled red button becomes the brightest thing on a near-black panel and reads as
the thing to press, so the danger roles resolve to a neutral `button-2` fill with
semantic `danger` text and icon.

```css
/* the only place the danger roles are used */
.panel .btn-danger {
  background: var(--color-button-danger);
  color: var(--color-button-danger-text);
}
```

Dialogs keep the global filled `.btn-danger`: there, a destructive confirmation
*is* the point, and it is the only primary action in the dialog.

---

## 6. The design-view layout grid

A four-column grid: rail, canvas, splitter, inspector. Plus a status bar row.

```css
.design-view {
  --rail-width: 46px;             /* the shell's left column */
  --shell-fillet: 12px;           /* inside radius of the chrome corner */
  position: relative;
  display: grid;
  grid-template-columns: var(--rail-width) minmax(0, 1fr) 6px
    var(--inspector-width, 320px);
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
}

.tool-rail {
  grid-column: 1; grid-row: 1;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  /* Align the first tile with the centre card's top edge. */
  padding: var(--gutter) 0;
  background: var(--color-shell);
  border-right: 0;                /* no border — surface contrast separates it */
}

.design-canvas { grid-column: 2; grid-row: 1; }
.inspector    { grid-column: 4; grid-row: 1; }
.status-bar   { grid-column: 1 / -1; grid-row: 2; }
```

**`minmax(0, 1fr)` on the flexible column is not optional.** Without the `0`
minimum, a long unbreakable child (a wide table, a long filename) pushes the
grid wider than its container and the splitter's measured width stops matching
what is on screen.

### Touch targets

```css
.tool-rail-button { width: 34px; height: 34px; }

@media (pointer: coarse) {
  .tool-rail-button { width: 44px; height: 44px; }
  .tool-rail { gap: var(--space-1); }
}
```

### The chrome budget

The header is the densest chrome in the app and the first thing that breaks at
the smallest supported width. Budget it: at **1024 px** the header carries at
most **eight visible interactive controls**. The brand is a non-interactive
`<span>`, not a button; a logo that looks clickable spends a slot for nothing.

When the budget is exceeded, collapse by priority — never by wrapping:

1. **Labels before controls.** The primary action's label and the current
   document name drop; the icon, the value and the tooltip stay.
2. **Secondary controls into overflow.** Theme, settings and About move into one
   "…" menu. The theme switch can stay in the header above 1200 px and move into
   that menu below it; it is always reachable either way.
3. **Never add a second row.** A second header row is a layout change, not a
   responsive state, and it steals height from the work surface at exactly the
   width where space is tightest.

The same rule applies to any toolbar: a control that needs a second row at the
minimum width belongs in a menu. This is checkable — count the interactive
controls in the header at 1024 px and assert there is no horizontal page scroll.

---

## 7. The chrome fillet

The advanced trick in the shell: when the header, the tool rail and the status
bar are one chrome surface wrapping a card, the gutter around the card turns a
hard 90° where they meet. A fillet paints a chrome quarter-circle into that
inner corner so the gutter flows around it instead of ending in a square notch.

```css
.design-view::before {
  content: "";
  position: absolute;
  top: 0;
  left: var(--rail-width);
  width: var(--shell-fillet);
  height: var(--shell-fillet);
  z-index: 1;
  pointer-events: none;
  /* Everything outside a fillet-radius circle centred one gutter inside the
     card's top-left corner (this box's bottom-right) is chrome, so the gutter
     shows through as a smooth concave arc instead of a square notch. */
  background: radial-gradient(
    circle at 100% 100%,
    transparent calc(var(--shell-fillet) - 0.5px),
    var(--color-shell) calc(var(--shell-fillet) - 0.5px)
  );
}

/* The same fillet at the other end of the rail column. */
.status-bar::before {
  content: "";
  position: absolute;
  left: var(--rail-width);
  top: calc(var(--shell-fillet) * -1);
  width: var(--shell-fillet);
  height: var(--shell-fillet);
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(
    circle at 100% 0%,
    transparent calc(var(--shell-fillet) - 0.5px),
    var(--color-shell) calc(var(--shell-fillet) - 0.5px)
  );
}
```

Two details that make it work:

- **`calc(var(--shell-fillet) - 0.5px)`** — the half-pixel stops the gradient's
  edge from shimmering.
- **In dark mode the fillet is invisible**, because the chrome and the gutter
  share a colour there. That is the point: it is a light-mode refinement that
  costs nothing in dark.

---

## 8. Dark theme

### The three blocks

```css
:root { /* light — always applies */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark, when the OS asks */ }
}

:root[data-theme="dark"] { /* dark, when the user forced it */ }
```

`system` leaves `data-theme` off, so the media query decides. `light` sets
`data-theme="light"`, which the `:not()` guard excludes. The two dark blocks
must stay **identical** — assert it in a test.

### Pre-paint theme, so there is never a flash

Put this inline in `<head>`, before any stylesheet:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'light' || t === 'dark') {
        document.documentElement.setAttribute('data-theme', t);
      }
    } catch (e) { /* private mode: fall through to the system theme */ }
  })();
</script>
```

The server is the source of truth for the theme; `localStorage` is only a
pre-paint cache so the first frame is already correct.

### Dark is layered surfaces, not borders

```
canvas (#000)  <  bg (#111)  <  panel (#181818)  <  panel-2 (#202020)  <  bg-hover (#242424)
```

Borders in dark are hairlines (`#2c2c2c`) that are almost invisible on purpose.
The canvas goes to **pure black** so the paper-white page is the brightest
thing on screen — that is the whole point of the hierarchy.

### Dark cards have no shadow

```css
--shadow-card: none;
```

In light, cards are separated by a soft shadow. In dark they are separated by
surface alone. A shadow on a near-black card is invisible noise.

### The scrim is a theme token

A fixed scrim opacity that reads in light disappears on a near-black UI. At 35 %
over a white page the veil still reads; over a `#111` app the paper behind it is
barely dimmed, so the dialog stops feeling modal. Make the scrim a role and make
dark heavier:

```css
:root {
  --scrim: color-mix(in srgb, var(--color-overlay) 40%, transparent);
}
:root[data-theme="dark"] {
  --scrim: color-mix(in srgb, var(--color-overlay) 65%, transparent);
}
```

Test the **rendered pixel** behind the scrim, not the opacity value: sample the
paper through the veil and assert it drops from 255 to about 153 in light and to
about 89 in dark. A token that looks right in the stylesheet can still be wrong
on screen.

### The system-dark and forced-dark blocks are duplicated on purpose

You cannot `@import` one into the other without a build step, and you cannot
merge them with a selector list (`@media` cannot be combined with a plain
selector in a comma list). So they are written twice, and a test asserts they
match:

```ts
expect(forcedDark).toEqual(systemDark);
```

---

## 9. Type, spacing, radii

**Type** — one family, system stack, no webfont, no CDN:

```css
--font-family: "Segoe UI", system-ui, sans-serif;
--font-size-xs: 11px;
--font-size-sm: 13px;
--font-size-base: 13px;
--font-size-lg: 16px;
--font-size-xl: 18px;
--font-size-2xl: 22px;   /* empty states, onboarding */
--font-size-3xl: 28px;
```

13px base is dense on purpose: this is a desktop precision tool, not a
marketing page. Larger sizes are for empty states, not for field labels.

**Spacing** — a 4/8/12/16/24/32 scale:

```css
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;
--space-4: 16px; --space-5: 24px;  --space-6: 32px;
```

24–32px padding for the big view panels, 12–16px for an inspector.

**Radii**:

```css
--radius-sm: 6px;    /* controls */
--radius-md: 8px;    /* panels, cards */
--radius-lg: 12px;   /* large surfaces */
--radius-pill: 999px;
```

Use `field-sizing: content` on a numeric field whose width should hug its
digits, so `79` does not float in a wide box.

### A heading is sentence case; caps is a field label

An 11 px uppercase caps label is a *field* label, never a heading. Headings —
card titles, inspector section titles, settings section titles — are sentence
case at 13 px / 600 in `--color-text`, with `text-transform: none` and
`letter-spacing: 0`. The distinction is what stops a settings dialog from
reading as a form legend repeated three times.

When a heading shares a row with a control, it keeps `margin-bottom: 0`. When it
stands alone, the space below it is a real block margin, not a margin on an
inline `<span>` (which does nothing).

---

## 10. Accessibility rules

These are acceptance criteria, not a phase at the end.

- **One focus treatment everywhere.** Every interactive control uses the same
  `:focus-visible`:

  ```css
  :focus-visible {
    outline: 2px solid var(--color-selection);
    outline-offset: 2px;
  }
  ```

  A focus ring belongs to the *control*, not to an inner element. If a field
  wraps a bare `<input>`, put the ring on the wrapper (`:focus-within`) so a
  small blue rectangle does not sit inside the field.

- **Disabled stays readable.** A flat fill with `--color-muted` text, not a
  faded opacity:

  ```css
  .btn:disabled { background: var(--color-panel-2); color: var(--color-muted); }
  ```

  `opacity: 0.4` on a button drops it below 4.5:1 against the panel. This is a
  real bug that most designs ship.

- **Contrast ≥ 4.5:1** for body and muted text on every surface in **both**
  themes. Assert it in a test, not by eye — `assets/theme-tokens.test.ts` does.

- **Keyboard = pointer.** Every drag has a keyboard equivalent (arrow keys,
  Shift for a larger step), every tab list has arrow-key navigation with a
  roving tabindex, every menu closes on Escape.

- **Roles on the splitter**:

  ```html
  <div role="separator" aria-orientation="vertical"
       aria-valuemin="280" aria-valuemax="520" aria-valuenow="320"
       aria-label="Resize inspector" tabindex="0"></div>
  ```

- **Targets**: ≥ 32px normally, ≥ 44px on coarse-pointer surfaces.

- **`prefers-reduced-motion`**: collapse animations and transitions, and stop
  any pulsing indicator.

- **`prefers-contrast: more`**: strengthen borders, muted text and the focus
  ring.

- **Status is words plus a tint, never colour alone.** A badge says
  "Confirmed", "Void" or "Needs review" and *also* carries a tint derived from
  its own semantic colour (`color-mix(in srgb, currentColor 8%, transparent)`).
  Colour-only status fails for colour-blind users and in a monochrome
  screenshot.

- **Sortable table headers are keyboard-operable and expose `aria-sort`.**
  Enter or Space toggles the sort; the header is a real button inside the
  `<th>`; the current direction is on the `<th>` as `aria-sort="ascending"` /
  `"descending"`. A table that only sorts on click is a mouse-only feature.

- **Long cell content wraps, it does not ellipsize.** A number range or a
  template name that ends in "…" hides the part the user came to read. Let the
  cell wrap and keep the table from forcing page-level horizontal scroll at the
  smallest supported width.

- **One modal stack owns Escape.** Every dialog registers in the same stack;
  Escape closes only the top-most, never every open dialog at once. Global
  shortcuts (undo, save, delete) are inert while any modal is open — a shortcut
  that reaches the editor behind a dialog edits something the user cannot see.

- **Shortcuts are scoped by target, not by key.** A text field owns all keys
  (the browser's own text undo included); a dialog or menu owns all keys while
  it is open; a `<select>` owns the arrow keys and type-ahead but not the
  modifier shortcuts; anywhere else the app may run its shortcuts.

- **Run axe in both themes.** A theme that only passes in light is not
  accessible.

---

## 11. The primitives contract

The full primitive contract is in `assets/primitives-README.md`. The four rules
for the primitives themselves:

1. **Adopt, don't re-style.** Never pass `className` to change a primitive's
   appearance. If a screen needs a different look, change the class in the
   stylesheet (and the tokens), so every screen follows. `className` is for
   layout only.
2. **Rule of three.** A pattern becomes a primitive after its third real use.
3. **No colour literals** — tokens only, enforced by lint.
4. **Every button is explicit about `type`.** Default `type="button"`;
   `type="submit"` only inside a real form.

Two rules for the panel that composes them:

5. **Offer an action only when it can run.** An align action appears at two
   selected items; distribute at three. If the blocker is the current selection,
   hide the action instead of rendering a disabled button that can never be
   enabled in that state. A dead control is not an affordance.
6. **A panel shows controls, not prose.** Labels, values and controls only;
   explanations belong on the control's `title`/tooltip. A primary state with
   zero instructional paragraphs is the target — the user reads the control,
   not a manual beside it.

Plus: every control keeps a `data-testid` where a spec already selects it, and
a `Field` clones its child and injects `id` / `aria-describedby` /
`aria-invalid` so the association cannot be forgotten.

---

## 12. Direct-manipulation surfaces

A canvas, grid or timeline that the user clicks and drags must own the keyboard
while it is the active surface. Otherwise a shortcut lands on the last-clicked
button and the work surface feels broken even though every handler is correct.
The editor is the obvious case, but the same contract applies to any surface
with a pointer gesture.

- **Take focus on pointerdown.** Call `wrapper.focus({ preventScroll: true })`
  in the gesture's `pointerdown`, because the gesture prevents the default focus
  change. Without it the focus stays on the last-clicked toolbar button and
  Space, arrows and undo are all aimed at the wrong place.

- **Space is a held modifier, not a shortcut.** The surface listens for
  `keydown`/`keyup` and only gives up for a text field, an open modal, or a
  control the user reached with the **keyboard** (Tab). A control the user
  clicked with the mouse does not keep Space: a stray Space must never
  re-activate the panel's Delete button.

- **Sample `:focus-visible` at focus time, not inside keydown.** Browsers
  recompute the flag on every key event, so a `keydown` handler always reads the
  wrong value. Listen on `focusin` and remember whether the focus came from the
  keyboard.

- **Release the modifier on `blur` / `visibilitychange`.** The keyup is lost
  when the user alt-tabs while holding Space; without this the surface stays
  stuck in pan mode when they come back.

- **A drag is one undo step.** Keep the preview in local state and commit once on
  `pointerup`; a gesture that writes on every move fills the undo stack with
  noise and makes undo unusable.

Check: focus a toolbar button, then Space-drag the surface — it pans. Click the
Delete button, press Space — it does not delete. Alt-tab away while holding
Space, come back, release — the surface is not stuck panning.
