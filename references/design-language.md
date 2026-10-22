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

---

## 5. Chrome roles

The indirections that make theming cheap.

| Role token | Light | Dark | Applied to |
|---|---|---|---|
| `--color-shell` | `panel` | `bg` | header, tool rail, status bar |
| `--color-field` | `panel` | `panel-2` (`#262626`) | inputs, selects |
| `--color-field-border` | `border` | `transparent` | …the border that comes back on hover |
| `--color-button-2` | `panel-2` | `panel-2` (`#262626`) | secondary buttons |
| `--color-button-2-border` | `border` | `transparent` | |
| `--color-seg` | `panel-2` | `bg` | segmented control track |
| `--color-seg-border` | `border` | `transparent` | |
| `--color-seg-active` | `panel` | `panel-2` (`#262626`) | the active segment |
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

- **Run axe in both themes.** A theme that only passes in light is not
  accessible.

---

## 11. The primitives contract

The full text is in `assets/primitives-README.md`. The four rules that matter:

1. **Adopt, don't re-style.** Never pass `className` to change a primitive's
   appearance. If a screen needs a different look, change the class in the
   stylesheet (and the tokens), so every screen follows. `className` is for
   layout only.
2. **Rule of three.** A pattern becomes a primitive after its third real use.
3. **No colour literals** — tokens only, enforced by lint.
4. **Every button is explicit about `type`.** Default `type="button"`;
   `type="submit"` only inside a real form.

Plus: every control keeps a `data-testid` where a spec already selects it, and
a `Field` clones its child and injects `id` / `aria-describedby` /
`aria-invalid` so the association cannot be forgotten.
