# Radiant Smiles Dental Care — website build

A static, seven-office dental practice site for Las Vegas and Henderson, built through the
deterministic `client-site-build` pipeline. This repo is the **build tree**: locked inputs, the design
system, the copy corpus, the composed pages, and the machine receipts that prove each page passed.

> **Status: BUILT AND PUBLISHED.** All 66 pages composed and assembled — `build.mjs --site` reports
> `Done: 66/66` with zero failures — and the site is live at
> <https://aeron-sgen.github.io/radiantsmiles-preview/>. `index` was built LAST on purpose, as an
> analytical router derived from the real pages. The [Current state](#current-state) table below still
> reflects the pre-`index` count; re-run the audit rather than trusting either number from memory.

---

## What this is, and what it is not

This is not a hand-written site. Every page is **composed from its own locked copy** against a shared
design kit, and no page ships until a 52-gate stack passes on it. The gates are the point: they encode
the failures this build is not allowed to repeat.

Two rules do most of the work:

- **The copy is locked.** Every rendered word must already exist in `_copy/<page>.md`. A page may
  re-order, re-tag and re-shape that copy; it may not write a new sentence, invent a figure, a
  credential, a date or a testimonial, or soften a flagged limitation. Where a fact does not exist,
  the page ships a visible `⚠OWNER` hold rather than something plausible.
- **Every page composes its own section set.** Sharing the chrome, tokens and kit is *required* —
  that is the cohesion. An identical ordered section sequence across pages is the failure, and
  `verify-page-distinct` blocks it at 80% skeleton similarity.

## Layout

| path | what lives there |
|---|---|
| `_handoff/` | **The locked inputs (C1–C7).** Sitemap, per-page briefs, client rules, content bible, decisions ledger, token spec, visual direction, plus `HANDOFF-RECEIPT.json`. Under checksum — **never edit by hand.** |
| `_copy/` | The 66-page copy corpus. The source of every rendered word. |
| `_design/` | Tokens, the chrome carrier, `radiantsmiles-structural.css` (the kit), the imagery system, and `_tournament/` — the concept fan-outs the owner picked from. |
| `pages/` | `<slug>.content.html` (the composed body fragment) and `<slug>.html` (the assembled page). |
| `_build/` | `_template.html`, the locked chrome shell derived from the approved carrier. |
| `_receipts/` | `promote-<page>.json` — the per-page gate result. **This, not the file on disk, is what proves a page passed.** |
| `_approvals.json` | The owner stamps. Each stage holds the next. |
| `_audit/` | Findings and evidence from the build's own investigations. |
| `assets/` | Client photography. |

## Current state

Composed pages, by type:

| type | composed | total |
|---|---:|---:|
| T-FEATURE (service leaves, offices, offer, FAQ, insurance) | 38 | 38 |
| T-HUB (nav hubs + service-category hubs) | 10 | 10 |
| T-ARTICLE (clinician biographies) | 10 | 10 |
| T-INDEX | 2 | 2 |
| T-LEGAL | 3 | 3 |
| T-COMPANY | 1 | 1 |
| T-CONTACT | 1 | 1 |
| T-HOME | 0 | 1 |
| **total** | **65** | **66** |

All 65 carry a clean, unfiltered 52/52 promote receipt (`failCount 0`, `gateCount 52`,
`filtered []`), and all 65 assemble: `build.mjs --site` reports `Done: 65/65` with zero failures
across its inline render stack.

Worst pairwise structural similarity across the whole set is **0.750** against a 0.80 block
threshold — and that pair is the two legal documents, which are *supposed* to share a template and
are exempt. No non-exempt pair comes near the limit. That did not happen by luck: all 66 copy files
share an identical 11-heading skeleton, which is exactly the shape that produced an earlier 86%
distinctness failure, so section counts were assigned centrally across a 3-to-11 spread and every
brief named the on-disk siblings sharing its count.

**272 owner holds** exist across the copy corpus. Every one is carried into its page as an HTML
comment, and **zero** render as visible text — verified by stripping comments and searching the
shipped fragments. Where a fact is withheld the page says so in the locked copy's own words; it
never invents one and never leaks build-facing instructions to a reader.

`index` (the home page) is built **last**, on purpose: it is an analytical router derived from the
real pages, not a template stamped first. Its owner-approved thesis is in `_audit/HOME-THESIS.md`.

## Verifying the build yourself

Do not trust a page because the file exists — `promote-concept` writes the fragment **even when a gate
fails**. The receipt is the evidence.

```sh
# every page: receipt clean + unfiltered, META directive present, asset refs resolve,
# built <title> is not the raw-slug fallback, plus the full distinctness matrix
node <scratchpad>/_verify/audit.mjs

# assemble every fragment into pages/<slug>.html (this also runs the render gates)
node <ace>/.claude/skills/client-site-build/scripts/build.mjs --site .

# the title sweep — note the CLI form is --site, NOT --page
node <ace>/.claude/skills/client-site-build/scripts/verify-title-quality.mjs --site .
```

**A gate given the wrong invocation form exits 0 without reading anything.** `--page` to a `--site`
gate looks exactly like a pass. This has already produced one false green in this build.

## Known open items

These are decisions and config, not build defects. They are recorded rather than papered over.

- **272 open `⚠OWNER` items** across the copy corpus, concentrated in four decisions: the clinician
  roster and per-office assignment, offer terms (expiry, exclusions, senior threshold), review-rating
  scope and platform of record, and insurance network status. Every one ships as an HTML comment on
  its page; **zero render as visible text.** Where a fact is withheld the page states that in the
  locked copy's own words rather than inventing one.
- **Sunrise Manor ZIP conflict** — 89107 vs 89104, affecting 13 pages. The build ships 89107 (site-wide footer, 70 occurrences) but the street address suggests 89104 may be correct; frequency here measures footer inheritance, not independent agreement. See `_audit/OPEN-DATA-CONFLICTS.md`.
- **North Decatur publishes hours identical to Lone Mountain** on all seven days. Investigated 2026-08-20: duplication is NOT a one-off — north-las-vegas and henderson share a block too, so "one record is wrong" is not established. Evidence in `_audit/OPEN-DATA-CONFLICTS.md`.
- **`#1` in `client-rules.json` bannedVocab compiles unanchored**, so it also matches inside
  `#10`–`#19`. Since `verify-selection-rationale` requires literal `<MENU>.md #N` citations, catalog
  items 1 and 10–19 were uncitable and so effectively unpickable. Worked around in the authoring
  convention (`# 11`, with a space, passes both gates); the regex itself is untouched because it is
  enforcement code.
- **`verify-conversion-integrity` was patched 2026-08-19 (owner-authorised).** Its `hasPrimaryCta()`
  resolved a page brief's `cta_primary` only through `linksToSlug()` — treating a human label as a
  slug, so it demanded `href="...Claim this offer.html"` and was unsatisfiable for any page with a
  page-specific CTA. It now also matches that label as text. Proven narrow before keeping: the old
  gate failed exactly one page (`offer`), the new gate fails none, and a negative control with the
  CTA labels neutralised still blocks (`EXIT=2`).
- **`SQUAH_PREVIEWS_BASE_URL` is not persisted.** It was set to
  `https://aeron-sgen.github.io/radiantsmiles-preview` for the 2026-08-21 publish and P14 completed, but
  it lives only in that shell. `publish-preview.mjs` dies fail-closed when it is unset, so any future
  publish must export it again or add it to the workspace env.
- **Vector logo (`⚠OWNER §G-7`)** — the wordmark is set in type, not the navy-and-yellow JPG, and the
  favicon currently ships an off-palette default.

## Note on where this repo lives

The Ace workspace root's `.gitignore` excludes all of `Code/client-sites/` — *"real client/business
data, NEVER ship, NEVER track"* — because the Ace distribution manifest is built from `git ls-files`.
That rule keeps client work out of the *distribution payload*; it does not stop a client build from
having its own history. So this tree carries its own git history, the same pattern as
`Code/web-mockup/desert-paws`. A repo at the workspace root would not capture this build at all.

**Merged 2026-08-24 — one repo, two branches.** The build tree and the published site used to live in
two separate GitHub repos (`aeron-sgen/radiantsmiles` and `aeron-sgen/radiantsmiles-preview`). They are
now one:

| branch | holds | |
|---|---|---|
| `source` | this build tree — `_design/`, `pages/`, `_handoff/`, `_audit/`, `_receipts/`, `_copy/`, `assets/` | what you are reading |
| `main` | the assembled flat site — 66 pages at the root, `design-system/`, `assets/` | what GitHub Pages serves |

Both live in **`aeron-sgen/radiantsmiles-preview`**. The merge went that direction, not the other, so
the live URL <https://aeron-sgen.github.io/radiantsmiles-preview/> did not move — GitHub does not
redirect a Pages path once it changes, and links to that URL were already circulating. The repo name
says "preview" while holding the source; renaming it would move the Pages URL, which is exactly what
the merge was arranged to avoid.

The two branches share their asset blobs. Git addresses objects by content, and the 374 files in
`assets/` are byte-identical on both sides, so they are stored once rather than twice.

`aeron-sgen/radiantsmiles` is archived. Nothing references it; `source` carries its full history.
