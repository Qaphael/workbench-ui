# Prompts

Copy-paste prompts for working on this skill. Each one is self-contained: hand
it to an agent and it does the job.

- **[P1 — Fold the app's new structure into the skill](#p1--fold-the-apps-new-structure-into-the-skill)**
  The main one. Use it whenever you add UI structure to the application and
  want the skill to keep describing the pattern you actually use.
- **[P2 — Add a new theme](#p2--add-a-new-theme)** — use it when you want the
  skill to be able to produce a different visual style, not just the one it
  ships with.
- **[The rule record](#the-rule-record)** — the shape every promoted rule is
  written in. Both prompts use it.

---

## P1 — Fold the app's new structure into the skill

### On a new machine, first

```bash
# 1. the tooling the skill's own checks need
node --version && python --version

# 2. the skill itself
npx skills add Qaphael/workbench-ui -g -y

# 3. THE PLACE TO EDIT - a clone, not the installed copy.
#    ~/.agents/skills/workbench-ui is only an installed copy and cannot be pushed.
git clone https://github.com/Qaphael/workbench-ui.git
cd workbench-ui

# 4. the application the patterns come from
git clone <the app> && cd <the app> && git switch ui/low-chrome-workbench

# 5. then run the prompt below from the workbench-ui clone
```

After pushing, refresh the installed copy:

```bash
npx skills update -g
```

### The prompt

```
PROMPT — Fold the app's new UI structure into the workbench-ui skill

CONTEXT
- The app: <path or clone URL> (Receipt Numberer; the UI work lives on the
  branch ui/low-chrome-workbench)
- The skill: workbench-ui, source of truth = the GitHub repo Qaphael/workbench-ui
- I have just added new UI structure to the app. Your job is to fold the
  PORTABLE parts of it into the skill, so the skill keeps describing the pattern
  I actually use — not the pattern as it was when the skill was written.

WORK IN THE RIGHT PLACE
  git clone https://github.com/Qaphael/workbench-ui.git
  cd workbench-ui        # EDIT HERE, not in ~/.agents/skills/ — that is only an
                         # installed copy and cannot be pushed
  # after pushing: npx skills update -g   (refreshes the installed copy)

WHAT CHANGED
  <paste the change, or: diff the app's working tree / last N commits, then
   read the app's design-system section (AGENTS.md -> "Design system & themes")
   and any new plan file it points at>

STEP 1 - HARVEST
  List every NEW or CHANGED visual/structural rule. Write each one in the
  RULE RECORD shape (see PROMPTS.md -> "The rule record" in the skill repo):
  Context / Goal / Files / Changes / Do not / Acceptance / Evidence
  Keep my wording where it is precise - do not paraphrase a rule into something
  vaguer than it is.

STEP 2 - PROMOTION TEST (this is the gate; a rule that fails it does not ship)
  1. It is a RULE, not an implementation detail of this app.
  2. Its "why" does not name the app - it would read the same in a different
     product. ("The canvas carries no floating chrome" is a rule. "The zoom
     control lives in the status bar" is not.)
  3. It has a CHECK you can automate: a lint, a unit assertion, an e2e
     assertion, or a grep. A rule nobody can check is a preference.
  Rules that fail are NOT promoted. List them in your report as "considered and
  rejected", with the reason - that list is as useful as the promotions.

STEP 3 - PUT EACH PROMOTED RULE IN THE RIGHT PLACE (exactly one place)
  - a new token, role, colour or geometry  -> assets/tokens.css
  - a new visual/structural rule            -> references/design-language.md
  - a new step in the migration method      -> references/migration-playbook.md
  - a new check the method demands         -> references/checklists.md
  - a portability note for another stack    -> references/portability.md
  - a new guard rail                       -> a script in assets/ AND its test
  Do NOT put rule text in SKILL.md. SKILL.md is the map; the references are its
  detail. If SKILL.md needs a line, it is a POINTER to a reference.

STEP 4 - MAKE IT CHECKABLE
  Every promoted rule gets a check that FAILS before the rule is implemented and
  PASSES after. Say so in the report. A rule with no check does not go in.

STEP 5 - PROVE THE SKILL STILL WORKS
  node assets/lint-colors.mjs --src assets --tokens assets/tokens.css
  node assets/contrast-check.mjs --tokens assets/tokens.css
  the token test, if the project has a runner
  python -m scripts.quick_validate <skill-dir>      (from the skill-creator skill)
  the skill's own eval set, if the method changed
  If a new theme or rule landed, add an eval to evals/evals.json that only
  passes with the skill - an assertion that passes either way proves nothing.

STEP 6 - VERSION AND SHIP
  - bump the VERSION file (it is the single source of truth)
  - add a row to PROGRESS.md, with the app commit you synced from
  - update evals/RESULTS.md if any number moved
  - update the README's file table if a new file shipped
  - commit (the message names the promoted rules) and push
  - rebuild the package and tag a release:
      node tools/package-skill.mjs
    That uses `git archive`, so it packages the COMMITTED state and cannot
    walk into `.git`. Do NOT point a tree-walking packager at the clone — it
    will walk the whole object store and hang.
  - attach the rebuilt dist/workbench-ui.skill to the release

DO NOT
  - change the app. This task is READ-ONLY against the app: you read it, you do
    not edit it. My change is already made.
  - change the licence, the repo name, or the install instructions
  - restyle the skill's own examples - they are the reference implementation
  - promote a rule that only makes sense in Receipt Numberer
  - add a runtime dependency to the skill
  - delete a superseded rule: mark it superseded and say why

ACCEPTANCE
  - every promoted rule appears in exactly one reference file, in the rule-record
    shape
  - every promoted rule has a check that fails without it
  - the skill's own checks pass
  - the report lists: PROMOTED (rule -> file -> check), CONSIDERED AND REJECTED
    (rule -> reason), and ANYTHING YOU COULD NOT CHECK
```

---

## P2 — Add a new theme

A *theme* is one set of values for the role tokens. The roles never change; a
new style is a new block of values, not a redesign. The shipped `workbench`
theme is the application's identity and must stay the default.

```
PROMPT — Add a <NAME> theme to the workbench-ui skill

CONTEXT
- The skill: workbench-ui, source of truth = the GitHub repo Qaphael/workbench-ui
- I want the skill to be able to produce a "<NAME>" style as well as the
  "workbench" one it ships with. "workbench" stays the default and stays
  byte-identical - it is an application's identity.

WORK IN THE RIGHT PLACE
  git clone https://github.com/Qaphael/workbench-ui.git
  cd workbench-ui

WHAT THE THEME IS
  <describe the character: the mood, the surface treatment, the accent. One
   paragraph. If you have a reference image or a palette, name it here.>

STEP 1 - DESIGN THE VALUES
  Fill in the role set for the new theme, in assets/tokens.css, as
  [data-style="<name>"] and [data-style="<name>"][data-mode="dark"].
  Every role the light theme declares must be declared in both new blocks.
  The ink tokens (--color-paper, --color-stamp, --color-brand) are inherited,
  never overridden.

STEP 2 - MAKE IT CHECKABLE
  - every role in the light theme is declared in the new theme's light block
  - the new theme's dark block declares the same role set as its light block
  - the new theme's dark surfaces are ordered by luminance
    (canvas < bg < panel < panel-2 < bg-hover)
  - body text and muted text clear 4.5:1 on every surface, in both modes
  Add these to the token test, so a broken theme fails the suite.

STEP 3 - DOCUMENT IT
  - a row in the theme table in references/design-language.md, with the hex
    values and the intent of each surface
  - the theme added to the "when to use which" guidance in the same file
  - if the theme implies a new rule, that rule goes through the promotion test
    in P1

STEP 4 - PROVE IT
  node assets/contrast-check.mjs --tokens assets/tokens.css
  node assets/lint-colors.mjs --src assets --tokens assets/tokens.css
  python -m scripts.quick_validate <skill-dir>
  Add an eval to evals/evals.json: "apply the <name> theme", with assertions
  that only pass if the roles were kept stable and the values swapped.

STEP 5 - VERSION AND SHIP
  - bump the VERSION file
  - add a row to PROGRESS.md
  - commit, push
  - rebuild the package with `node tools/package-skill.mjs` and attach
    dist/workbench-ui.skill to a new release
    (git archive based: it packages the committed state and cannot walk into
     .git. Do NOT point a tree-walking packager at the clone - it hangs.)

DO NOT
  - change the "workbench" theme, or make it anything other than the default
  - add a runtime dependency
  - restyle the skill's own examples

ACCEPTANCE
  - the new theme passes the role-set, ordering and contrast checks in both
    modes
  - the "workbench" theme is byte-identical to before
  - the report lists the full token table of the new theme
```

---

## The rule record

Every rule promoted into the skill is written in this shape. It is the same
shape used for the change requests that produced the skill, so the skill and
the application read the same way.

```markdown
### C-nn - <the rule, as a short title>

**Context.** <what exists today, and where>

**Goal.** <what should be true afterwards>

**Files.** <the files this touches>

**Changes.** <the specific changes, as concrete rules>

**Do not.** <what must not move: the light palette, the semantics, the
dependencies, the accessibility floor>

**Acceptance.** <the observable check, per theme and per size>

**Evidence.** <the commands that were run and their real output>
```

**Rules for the record itself**

- The title is the rule, not the implementation. "The work surface carries no
  floating chrome" — not "move the zoom control".
- The "why" goes in the Context or the Goal, and it must not name the
  application. If it only makes sense for one product, it is not a rule.
- Every record names a check that can be automated. If you cannot write one,
  the rule is a preference and it does not go in.
- Supersede, do not delete. A rule that stops being true gets a line saying
  what replaced it and why.
