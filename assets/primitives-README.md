# UI primitives

Small, unstyled-in-JSX components for the shared visual language. They render
the shared classes from the stylesheet (`.btn`, `.input`, `.select`, `.seg`,
`.badge`, `.empty-state`, plus `.ui-panel` / `.ui-tabs`), so **the stylesheet
is still the single source of truth for how things look**. These components
exist to stop markup drifting between screens; they are not a design system
with its own runtime styling.

## Rules

1. **Adopt, don't re-style.** Never pass `className` to change a primitive's
   appearance. If a screen needs a different look, change the class in the
   stylesheet (and the tokens), so every screen follows. `className` is for
   layout only (e.g. `flex-1`, `inspector-unit-toggle`).
2. **Rule of three.** A pattern becomes a primitive when it genuinely repeats
   three times. `Dialog`, `CommitInput`, `ErrorBanner`, `SheetScrubber`, `Toast`
   and `SplitHandle` are already shared and stay as they are.
3. **No colour literals.** Colours come from tokens; the `lint:colors` script
   fails the build otherwise.
4. **Every control keeps a `data-testid`** where an e2e spec already selects
   it. Pass it through like any other prop.
5. **Every button is explicit about `type`.** `Button`/`IconButton` default to
   `type="button"`; pass `type="submit"` only inside a real form.
6. **Interactive targets are ≥ 32 px** (44 px for the tool rail and other
   coarse-pointer surfaces). Use `size="sm"` only for dense toolbar rows.
7. **Accessibility wiring is not optional.** A primitive that owns a label must
   own the ARIA association too, so a caller cannot forget it.

## When to use which

| Need | Use | Notes |
|---|---|---|
| Text action | `Button` | `variant`: primary / secondary / ghost / danger; `size`: md / sm; `leadingIcon` |
| Icon-only action | `IconButton` | `label` is required and becomes `aria-label` + tooltip |
| Labelled input | `Field` + `TextInput` / `NumberInput` / `Select` | `Field` owns the label, hint, error and the ARIA wiring |
| Exclusive small choice | `SegmentedControl` | `role="group"` + `aria-pressed`; `value={null}` renders a mixed state |
| Switching views inside a panel | `Tabs` | `role="tablist"`, roving tabindex, Arrow/Home/End; render the panel with `tabPanelElementId()` |
| Bordered surface with a heading | `Panel` | Owns surface, padding, radius and the section heading |
| "Nothing here yet" | `EmptyState` | `title` is required; add an `action` for the next step |
| Short status label | `Badge` | `tone="ok"` for success; one or two words only |

## Field wiring

`Field` clones its single child and injects `id`, `invalid`,
`aria-describedby` and `aria-invalid`, so callers cannot forget the association:

```tsx
<Field id="copies" label="Copies" hint="1–100" error={error}>
  <NumberInput value={copies} onChange={(e) => setCopies(e.target.value)} />
</Field>
```

Do **not** set `id` on the child yourself; pass it to `Field`.

## Dev gallery

`#/ui-gallery` (development only) renders every primitive and state — variants,
sizes, disabled, invalid, icon-only, mixed segmented value, tab focus order — in
one page, with the header theme switch. An e2e spec screenshots it and runs axe
over it in both themes. It is not linked from production navigation and the
route is compiled out of production builds.

The gallery is not a toy: it is the only place where a primitive's *states*
live side by side, and a screenshot test over it is what stops a primitive from
quietly losing its disabled or invalid styling.

## Adoption status

Phase 3 only *adds* these components. Screens are migrated deliberately, one
phase at a time, so each phase's diff stays reviewable:

- Phase 4 — the first screen
- Phase 5 — the second screen
- Phase 6 — the inspector
- Phase 7 — history, settings, dialogs

Until a screen is migrated, its hand-written markup keeps working unchanged.
