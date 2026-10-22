# The migration playbook

The phases, in order, with the reasoning that decides them. The visual spec is
in `design-language.md`; this is about *how to get there without breaking
anything*.

**Contents**

1. [Why this order](#1-why-this-order)
2. [Phase 0 — Baseline](#phase-0--baseline-and-safety-net)
3. [Phase 1 — Tokens](#phase-1--design-tokens-and-dark-surface-hierarchy)
4. [Phase 2 — Shell](#phase-2--resizable-shell)
5. [Phase 3 — Primitives](#phase-3--ui-primitives)
6. [Phase 4/5 — Pilot and expand](#phase-45--pilot-then-expand)
7. [Phase 6 — Polish](#phase-6--polish)
8. [Phase 7 — Refactor](#phase-7--refactor-no-style-change)
9. [Phase 8 — QA](#phase-8--qa-docs-and-release)
10. [Brownfield vs greenfield](#10-brownfield-vs-greenfield)
11. [Running it across sessions](#11-running-it-across-sessions-and-machines)
12. [Proving neutrality](#12-proving-neutrality)

---

## 1. Why this order

Each phase makes the next one cheap.

```
tokens  →  shell  →  primitives  →  pilot  →  expand  →  polish  →  refactor  →  QA
   │         │           │            │         │          │           │          │
   │         │           │            │         │          │           │          └─ prove it still works
   │         │           │            │         │          │           └─ same app, easier to read
   │         │           │            │         │          └─ the details that need the system to exist
   │         │           │            │         └─ one screen per commit
   │         │           │            └─ the contract, proven on one screen
   │         │           └─ so the pilot has something to adopt
   │         └─ so the primitives have somewhere to live
   └─ so nothing else has to know a colour
```

Two orderings are worth defending:

- **Tokens before shell.** If the shell is built first, it hard-codes the
  colours it happens to use, and the token layer becomes a rename exercise
  rather than the source of truth.
- **Refactor last.** Splitting a god component before the primitives exist just
  relocates the mess into more files. Split it after, and the split is along
  seams that already exist.

---

## Phase 0 — Baseline and safety net

**Goal:** know the starting state exactly, so every later claim of "nothing
changed" is checkable.

- [ ] Run the full suite and **record the real numbers** — not "tests pass",
  but "398 backend, 195 unit, 103 e2e in 18.1 min".
- [ ] **Record the current light palette.** Every colour token that exists
      today, with its value. This is the freeze.
- [ ] **Hash the built CSS** and store the hash. This is the baseline that
      later proves a refactor was style-neutral.
- [ ] **Record the structural problems** you are about to address: the god
      component, the one giant stylesheet, the fixed-width panes, the raw
      control counts. Numbers here are the argument for the refactor later.
- [ ] Note any **pre-existing flakiness**, with a diagnosis. A flaky test you
      inherit is not a flaky test you caused, and the difference matters when
      you are asked why the suite went red.

The single most valuable output of Phase 0 is the light-palette record. Without
it, "don't change the light theme" is a good intention; with it, it is a test.

---

## Phase 1 — Design tokens and dark surface hierarchy

**Goal:** one place that owns every colour, and a dark theme that layers
surfaces instead of outlining them.

- [ ] Add the token stylesheet. Copy `assets/tokens.css` and replace the light
      values with the app's **actual** current palette.
- [ ] Add the **colour lint** in the same commit. A lint added later meets a
      codebase that has already grown violations, and you end up fixing them
      in bulk instead of preventing them.
- [ ] Add the **frozen-palette test** in the same commit. Copy
      `assets/theme-tokens.test.ts` and paste the app's real values into
      `FROZEN_LIGHT_COLOURS`.
- [ ] Add the dark theme: the three resolution blocks, the pre-paint script
      (`assets/theme-boot.html`), and the server-side persistence if the app
      has a settings store.
- [ ] Add the **chrome roles** (`--color-shell`, `--color-field`,
      `--color-button-2`, `--color-seg*`) resolving light to today's values.
- [ ] **Verify**:
  - [ ] the light fingerprint is byte-identical to the Phase 0 record;
  - [ ] the two dark blocks are identical to each other;
  - [ ] dark surface luminance increases monotonically canvas → bg-hover;
  - [ ] contrast ≥ 4.5:1 for text and muted on every surface, in both themes;
  - [ ] the colour lint passes.

At the end of Phase 1 the app should look **exactly the same** in light mode.
That is the test of the phase: if anything moved, a token resolved to the wrong
value.

---

## Phase 2 — Resizable shell

**Goal:** the borderless frame, the card geometry, and draggable panes.

- [ ] The window frame: the mat, the padding, the one rounded outline.
- [ ] `--gutter`, `--radius-card`, `--shadow-card` — one geometry for every
      card in the app.
- [ ] The chrome roles applied to the handful of places that use them.
- [ ] The **pure resize maths** module (`assets/split.ts`) + its unit tests
      (`assets/split.test.ts`). Keep it DOM-free.
- [ ] The splitter component: pointer capture, double-click reset, arrow keys,
      Shift for a larger step, full `role="separator"` ARIA, persisted widths
      in `localStorage` (never in the template, the database or the undo
      history).
- [ ] Convert the fixed-width panes to the splitter.
- [ ] **Verify**: light mode still looks the same; the measured pane width is
      exactly the visible card edge; the splitter works with the keyboard.

**The splitter contract:** the wrapper keeps its measured width; the card is
inset with padding or a pseudo-element, never by shrinking the pane. If you
put the card's border and padding on the pane itself, the measured width and
the visible card edge drift apart, and the user drags a boundary they cannot
see.

---

## Phase 3 — UI primitives

**Goal:** stop the markup drifting between screens, so the later screens are
cheap and consistent.

- [ ] Add the primitives: `Button`, `IconButton`, `Field`, `TextInput`,
      `NumberInput`, `Select`, `SegmentedControl`, `Tabs`, `Panel`,
      `EmptyState`, `Badge`.
- [ ] Each primitive renders the **shared class**, not its own styles. If a
      primitive needs its own CSS, that CSS goes in the stylesheet next to the
      others, not inline.
- [ ] Write the primitives README (copy `assets/primitives-README.md`) — the
      contract that stops the next person from re-styling a primitive.
- [ ] Add the dev-only gallery, **compiled out of production** so it costs no
      bundle.
- [ ] Add the e2e spec that screenshots the gallery and runs axe over it in
      both themes.
- [ ] **Verify**: build is clean; the gallery renders every variant and state;
      the gallery is absent from the production bundle.

The primitives layer is *additive*. Until a screen is migrated, its
hand-written markup keeps working unchanged — that is what makes the layer
safe to land before the screens are ready.

---

## Phase 4/5 — Pilot, then expand

**Goal:** prove the contract on one screen, then roll it out.

**Choosing the pilot** matters more than people expect:

- **Lowest risk, highest impact.** A screen with real content but no
  destructive actions and no tricky geometry.
- **Not the busiest screen.** The pilot is where you discover the contract is
  wrong; you want to discover that on a cheap screen.
- **Not the simplest screen either.** If the pilot is trivial you learn nothing.

A good first pilot is a content-heavy list or grid screen (a start screen, a
history table). A bad first pilot is the app's most complex screen.

**Per screen:**

- [ ] Migrate the markup to the primitives.
- [ ] Give it the card treatment and the shell pattern.
- [ ] Make every state explicit: loading, empty, error, dirty, disabled.
- [ ] Check the empty state: short heading, one sentence, one primary action.
- [ ] Check the disabled states are readable (flat fill + muted text, not a
      faded opacity).
- [ ] **Verify**: axe in both themes, screenshots in both themes, the screen's
      existing e2e specs still pass.

Then repeat, **one screen per commit**, going from lowest-risk to highest.

---

## Phase 6 — Polish

- [ ] Quiet the chrome: the header, the tool rail, the inspector tabs. One
      filled accent per group; the one filled *button* is the view's primary
      action.
- [ ] Move floating chrome into the frame. A control that floats over the work
      surface will eventually cover the work; the zoom control and the book
      size belong in the status bar, where they cannot cover anything.
- [ ] Empty states: short heading, one sentence, one primary action.
- [ ] `@media (prefers-reduced-motion: reduce)` — collapse transitions and
      stop any pulsing indicator.
- [ ] `@media (prefers-contrast: more)` — strengthen borders, muted text and
      the focus ring.
- [ ] The focus ring belongs to the **control**, not to an inner element. If a
      field wraps a bare input, use `:focus-within` on the wrapper so a small
      blue rectangle does not sit inside the field.

---

## Phase 7 — Refactor (no style change)

**Goal:** the same app, easier to navigate.

- [ ] Split god components into hooks or feature folders. Each hook owns one
      concern; the shell keeps composition and routing only.
- [ ] Split the one stylesheet into ordered feature files, with an ordered
      `@import` entry that has no rules of its own.
- [ ] **Prove neutrality** (see §12): the built CSS hash is unchanged, and the
      e2e suite passes unchanged.

Moving CSS is not a style change. If the built hash differs, something moved —
find it before you commit.

---

## Phase 8 — QA, docs, release

- [ ] Axe passes in **both** themes, every screen.
- [ ] Screenshots captured and reviewed in both themes.
- [ ] The light theme's screenshot diffs are structural only.
- [ ] The project instructions file, the README and the platform test plan are
      updated.
- [ ] The packaged build is verified, or explicitly listed as needing
      verification on that platform.
- [ ] The plan's checklist and progress log are up to date.

---

## 10. Brownfield vs greenfield

| | Brownfield | Greenfield |
|---|---|---|
| Light palette | **Freeze the existing one.** Pin it in a test. | Design it, then pin it once approved |
| Dark palette | Derive from the existing brand | Design alongside light |
| Token order | Tokens first, resolving to today's look — the app must not change appearance until you deliberately change it | Tokens from day one, dark from day one |
| Primitives | Land the layer **before** migrating any screen; unused primitives cost nothing | Extract at the third use, same as brownfield |
| Refactor | Phase 7, after the screens | Whenever the first god file appears |
| Biggest risk | The redesign is mistaken for a regression, because the app's appearance changed without anyone deciding it should | Building a design system before there is a second screen to validate it against |

**The brownfield trap:** if the tokens resolve to *new* values in the first
commit, every later screenshot diff is noise, and nobody can tell a deliberate
change from a mistake. Make the first token commit a no-op visually, then turn
the values one at a time.

---

## 11. Running it across sessions and machines

A redesign spans weeks and two machines. Two habits make that survivable:

**A decision log, updated *before* implementing.** When a decision changes,
write it down first. The log records the *reason*, which is the part that is
lost otherwise — and the reason is what stops the next session from
re-litigating it.

**A progress log, updated every session.** One row: date, who, phase, commit,
what changed, what's next, with the real evidence numbers.

Plus a **resume prompt** (see `templates/UI_PLAN.md` §8.7) that a new agent or
a new machine can be handed verbatim. It names the constraints, the commands,
and — crucially — where to resume.

---

## 12. Proving neutrality

The hardest part of a refactor is proving you did not change anything. Most
teams assert it; the strong ones measure it.

**For a CSS refactor**, hash the built stylesheet before and after:

```bash
# before
npm run build
sha256sum frontend/dist/assets/*.css   # or: certutil -hashfile dist\assets\index.css SHA256

# after — same build command
sha256sum frontend/dist/assets/*.css
```

Identical hashes mean the cascade is untouched. That turns "I believe this
refactor changed no style" into a fact you can put in the commit message:

```
refactor: split index.css into feature stylesheets (no style change)

The built CSS is byte-identical: SHA256 182B48CA…3BDFE86, 60.47 kB.
This proves the cascade and the shell pattern are untouched.
```

**For a component refactor**, the proof is the suite: the same e2e specs, the
same assertions, passing unchanged. If a spec had to change, the refactor was
not neutral — say so in the commit rather than quietly updating the spec.

**The habit to build:** every neutral change gets a number in its commit
message. Over a long project, that number is the evidence that the redesign
was done carefully — and it is the first thing anyone looks for when they
wonder whether they can trust the branch.
