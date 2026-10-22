# Progress log

Every change to the skill gets a row here, newest at the bottom. The log is
what makes the skill's history legible: it says what each version added, what
evidence backs it, and what was synced from where.

The rule is one row per **change**, not per release — a rule added, a check
added, a version bumped. A release is just the rows that happened since the
last tag.

## Columns

| Column | What it records |
|---|---|
| Date | When the change landed |
| Version | The `VERSION` value the change was released under |
| Change | One line: what changed and why it was worth doing |
| Evidence | The commands you ran and their real result |
| Synced from | The app commit the change was derived from, or `—` for a change that touches no app |

"Synced from" is the important one. This skill is extracted from a real
application, and that application keeps moving. Recording the commit says
exactly how far the skill is behind, so a reader can tell "the skill is out of
date" from "the skill never covered this".

## Log

| Date | Version | Change | Evidence | Synced from |
|---|---|---|---|---|
| 2026-10-22 | 1.0.0 | **First version.** The five contracts (tokens own colour, the shell pattern, the primitives layer, pure logic, the phased method), the four references, the eight bundled artifacts, the plan-document template, and the evaluation set. | `lint:colors` OK · `contrast-check` 10/10 AA pairs · the shipped `tokens.css` satisfies the shipped token test (dark blocks identical, luminance strictly increasing, ink inherited, frozen-light fingerprint matching) · evaluation: 9/9 with the skill vs 5/9 without on the full-redesign eval | `Qaphael/receipt-numberer` @ `cef44d8` (`ui/low-chrome-workbench`) |
| 2026-10-22 | 1.1.0 | **The skill can now maintain itself.** Added `VERSION` (the single source of truth for the version), this progress log, and `PROMPTS.md` — a copy-paste prompt that folds new structure from the application into the skill, with a promotion gate so only portable rules are promoted. No design rule changed. | `lint:colors` OK · `contrast-check` 10/10 AA pairs · `quick_validate` → "Skill is valid!" · the `.skill` package rebuilt and attached to the v1.1.0 release | `Qaphael/receipt-numberer` @ `cef44d8` (`ui/low-chrome-workbench`) |

## Using it

When you change the skill, add a row **in the same commit** as the change. The
prompt in [`PROMPTS.md`](PROMPTS.md) does this for you.

To see how far the skill is behind the application it was extracted from:

```bash
# what the app has changed since the skill's last sync
git log --oneline <app-commit>..HEAD
```
