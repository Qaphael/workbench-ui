# Ledgerly — a small invoicing app (BEFORE the redesign)

This is a deliberately **messy** front-end, standing in for the kind of app this
method is applied to. It is the fixture for the `workbench-ui` skill's evals.

## What is wrong with it on purpose

- One 300-line stylesheet with **hard-coded hex colours everywhere** — there is
  no token layer, so dark mode is impossible without editing every rule.
- No dark mode at all.
- `App.tsx` is a **god component**: the toolbar, the invoice list, the status
  footer, the filter chips and the modal all live in one file.
- Inline `style={{ color: '#6b7280' }}` scattered through the JSX.
- Fixed-width side panel, no resizable panes.
- No primitives layer — every button and input is hand-written markup.
- The light palette is **the app's identity**. Whatever happens, these values
  should still exist in the redesigned app:

  | Token name it never had | Hex | Role |
  |---|---|---|
  | app background | `#f4f5f2` | the window background |
  | panel | `#ffffff` | card surfaces |
  | panel-2 | `#eceef0` | tracks, chips |
  | border | `#dfe3dc` | hairlines |
  | text | `#23282f` | body text |
  | muted | `#6b7280` | secondary text |
  | primary | `#2f4f7a` | the brand blue |
  | danger | `#b42318` | destructive actions |
  | success | `#16794a` | paid invoices |
  | canvas | `#e7eae3` | the well behind the table |

- No docs, no plan, no decision log.

## Structure

```
index.html
package.json
src/
  main.tsx
  App.tsx        <- god component
  styles.css     <- 300 lines, hard-coded hexes
  types.ts
```

There is **no** `node_modules` and no build step — this fixture is checked by
reading files and running the skill's plain-Node scripts, so the evals need no
`npm install` and no browser.
