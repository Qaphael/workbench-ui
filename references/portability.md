# Portability — the same contract in other stacks

The contract is not React's. Tokens, a borderless shell, inset cards, one
gutter, one accent per group, and measurable neutrality are stack-agnostic.
This document is how to express each piece elsewhere.

**Contents**

1. [The stack-agnostic core](#1-the-stack-agnostic-core)
2. [Vue](#2-vue)
3. [Svelte / SvelteKit](#3-svelte--sveltekit)
4. [Plain HTML + CSS](#4-plain-html--css)
5. [Tailwind](#5-tailwind)
6. [CSS-in-JS and CSS modules](#6-css-in-js-and-css-modules)
7. [Desktop / native shells](#7-desktop--native-shells)
8. [Apps that already use a component library](#8-apps-that-already-use-a-component-library)
9. [What never changes](#9-what-never-changes)

---

## 1. The stack-agnostic core

| Layer | What it is | React? | Vue? | Plain CSS? |
|---|---|---|---|---|
| Token layer | CSS custom properties | ✅ | ✅ | ✅ |
| Resolution order | three blocks, media query + attribute | ✅ | ✅ | ✅ |
| Shell / cards | CSS | ✅ | ✅ | ✅ |
| Chrome roles | CSS custom properties | ✅ | ✅ | ✅ |
| Theme switching | one attribute on `<html>` + a pre-paint script | ✅ | ✅ | ✅ |
| Primitives | components | ✅ | ✅ | ⚠️ see §4 |
| Pure logic | plain modules + unit tests | ✅ | ✅ | ✅ |
| Guard rails | a lint script + a token test | ✅ | ✅ | ✅ |
| Splitter maths | a pure module | ✅ | ✅ | ✅ |

**The split is clean: only the primitives layer is framework-specific.** If you
are not in React, take the token layer, the shell CSS, the roles, the guard
rails and the pure modules verbatim, and reimplement the primitives in your
framework.

---

## 2. Vue

```vue
<!-- Field.vue — the clone-and-inject pattern, in Vue -->
<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';

const props = defineProps<{
  id: string;
  label: string;
  hint?: string;
  error?: string;
}>();

const attrs = useAttrs();
const slots = useSlots();
const describedBy = computed(() =>
  [props.hint && `${props.id}-hint`, props.error && `${props.id}-error`]
    .filter(Boolean)
    .join(' ') || undefined,
);
</script>

<template>
  <div class="field">
    <label class="field-label" :for="props.id">{{ props.label }}</label>
    <slot
      :id="props.id"
      :aria-describedby="describedBy"
      :aria-invalid="props.error ? 'true' : undefined"
      v-bind="attrs"
    />
    <p v-if="props.hint" :id="`${props.id}-hint`" class="field-hint">{{ props.hint }}</p>
    <p v-if="props.error" :id="`${props.id}-error`" class="field-error">{{ props.error }}</p>
  </div>
</template>
```

The rule that matters is the same: **the primitive owns the ARIA association**,
so a caller cannot forget it.

---

## 3. Svelte / SvelteKit

Svelte's snippet/props model maps cleanly:

```svelte
<!-- Field.svelte -->
<script lang="ts">
  let { id, label, hint, error, children } = $props();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(' ') || undefined;
</script>

<div class="field">
  <label class="field-label" for={id}>{label}</label>
  {@render children({
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? 'true' : undefined,
  })}
  {#if hint}<p id={`${id}-hint`} class="field-hint">{hint}</p>{/if}
  {#if error}<p id={`${id}-error`} class="field-error">{error}</p>{/if}
</div>
```

---

## 4. Plain HTML + CSS

Without a component layer you lose the "a caller cannot forget the ARIA
association" guarantee, so compensate with a **documented snippet** and a
lint that checks it:

- Keep the four primitive rules in a `CONTRIBUTING` / style guide.
- Add a small checker that greps for `<label for="...">` without a matching
  `id`, and for `<button>` without a `type`.
- Keep the CSS layer exactly as-is — that part is unchanged.

The rule of three still applies: extract a partial / include / Web Component
after the third use.

**A middle path:** use plain custom elements (`<ui-button>`,
`<ui-field>`). They give you the encapsulation of a primitive with no
framework, and the styling still lives in the stylesheet.

---

## 5. Tailwind

Tailwind is fine — but **exactly one system may own colour**. If Tailwind
owns it, the tokens become Tailwind theme variables and the colour lint
becomes a lint over the Tailwind config instead of over the source.

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        panel: 'var(--color-panel)',
        'panel-2': 'var(--color-panel-2)',
        canvas: 'var(--color-canvas)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        selection: 'var(--color-selection)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        shell: 'var(--color-shell)',
        field: 'var(--color-field)',
        'button-2': 'var(--color-button-2)',
        seg: 'var(--color-seg)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        card: 'var(--radius-card)',
      },
      spacing: {
        1: 'var(--space-1)', 2: 'var(--space-2)', 3: 'var(--space-3)',
        4: 'var(--space-4)', 5: 'var(--space-5)', 6: 'var(--space-6)',
        gutter: 'var(--gutter)',
      },
    },
  },
};
```

Note the pattern: **the Tailwind scale references the tokens, it does not
redefine them.** The tokens stay the single source of truth, the dark theme
still works by swapping the custom properties, and the frozen-palette test
still applies.

The lint then becomes: no literal hex in a class name or a config outside the
token block. `bg-[#26324d]` is the Tailwind equivalent of a hex literal and
should fail the same way.

---

## 6. CSS-in-JS and CSS modules

**CSS modules** are fine and behave like plain CSS: they do not own colour, so
the token layer stays the source of truth. Keep the lint.

**CSS-in-JS** is where the frozen-light rule gets awkward, because the values
live in JavaScript. Two workable options:

1. **Keep the tokens in CSS** and read them via `var(--color-x)` inside the
   styled component. The tokens stay in one stylesheet and the frozen test
   still works.
2. **Keep the tokens in JS** and generate the CSS custom properties from a
   single JS object at runtime, then pin that object in a unit test instead of
   a stylesheet. The test changes shape but not its purpose.

What to avoid: tokens in CSS *and* a theme object in JS, kept in sync by hand.
Two sources of truth is one too many, and they will diverge.

---

## 7. Desktop / native shells

The pattern was proven in a desktop web view (a Python + React + WebView2
app), and it transfers to other shells:

| Shell | Notes |
|---|---|
| **Tauri / Electron / WebView2** | The pattern is native to the DOM — use it unchanged |
| **SwiftUI / Jetpack Compose** | The *tokens* and the *one-accent-per-group* rule transfer; the CSS layer does not. The equivalents are semantic colours, one spacing scale, one corner radius per surface kind, and one elevation model |
| **Qt / wxWidgets / Tk** | Same: take the token table and the role indirection; drop the CSS |

The transferable idea in every shell is the **role indirection**: define
`shell`, `field`, `button-2` and `seg` once, resolve them per theme, and an
entire class of controls changes character without touching a component.

---

## 8. Apps that already use a component library

If the app already uses MUI, Ant Design, Bootstrap, Chakra, shadcn or similar,
do **not** fight the library and do **not** rip it out in the same project.
Two different situations, two different answers.

### Situation A — the library is the app's visual identity

(Material Design, Bootstrap, an in-house "Design System 2.0".)

**Then the workbench pattern is mostly not applicable, and saying so is the
right answer.** A Material app has a documented elevation model, a type scale
and a component set; imposing a second card/gutter/radius system on top
produces the visual equivalent of two people talking at once.

What still transfers, cheaply:

- **The frozen-light rule** — the library's palette is the identity. Freeze it.
- **Dark mode as a library theme** — Material and Chakra both have a dark
  theme; use theirs rather than inventing one.
- **The shell pattern** — a borderless frame with inset cards can sit *around*
  a library's components. The library still owns the components; you own the
  frame, the gutter and the card geometry.
- **One primary action per view** and **one filled accent per group** — these
  are composition rules, not style rules, and they work with any library.

Tell the user this plainly rather than applying the whole method and
apologising later.

### Situation B — the library is incidental

(shadcn-style copied components, a handful of MUI imports nobody wanted, a
Bootstrap grid used for layout only.)

**Then the primitives layer in this skill replaces the library's components.**
This is the shadcn model exactly: you own the source, so you own the styling.

The order that works:

1. **Do not delete anything yet.** Add the token layer and the primitives.
2. Migrate screens to the primitives, one screen per commit.
3. Once no screen imports the library, remove it — and remove its CSS
   overrides, its theme provider, and its bundle weight.

Removing a component library is a satisfying commit and a genuinely risky one.
Make it its own phase, after the screens are migrated, with the build size
before and after in the commit message.

### The three-way rule for colour ownership

If a library, a utility framework and your own stylesheet all define colours,
you have three sources of truth and the theme will drift. Pick exactly one
owner — usually the token layer — and make the other two *reference* it:

```js
// Material UI: point the library's palette at your tokens
const theme = createTheme({
  palette: {
    background: { default: 'var(--color-bg)', paper: 'var(--color-panel)' },
    primary: { main: 'var(--color-primary)' },
    divider: 'var(--color-border)',
  },
});
```

If a library cannot be pointed at your tokens, it becomes the owner of *its
own* colours and your scope shrinks to the frame around it. Say which you
chose, and why, in the decision log.

---

## 9. What never changes

Whatever the stack:

1. The light palette is frozen in a brownfield app, and the freeze is pinned by
   a test.
2. Dark mode is layered surfaces, not outlines.
3. Ink tokens (paper, stamp, brand) are theme-independent.
4. The shell is borderless; content is grouped into inset cards.
5. One geometry for every card: one gutter, one radius, one shadow.
6. One filled accent per group; one filled primary button per view.
7. Bottom chrome is a recessed strip, not a card.
8. Every primitive owns its accessibility wiring.
9. Pure logic is DOM-free and unit-tested.
10. Every neutral refactor is *measured*, not asserted.
11. The guard rails land in the same commit as what they protect.
