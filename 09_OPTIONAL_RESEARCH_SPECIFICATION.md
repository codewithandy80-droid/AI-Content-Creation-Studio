# 9. Optional External Research Specification

## Purpose
Provide a separate, user-controlled research stage after source-only analysis. Research must not be silently mixed into the initial source analysis.

## Default state and modes
- Research is **OFF by default** for each project.
- User explicitly enables it in the Project Workspace.
- **Quick:** limited search and concise findings.
- **Deep:** more sources and cross-checking, subject to verified free quotas.
- **Adaptive:** start with Quick and deepen when gaps, conflicts, or weak evidence are detected, within configured limits.

## Workflow
1. User enables research and chooses mode.
2. App checks search-service and AI-model availability/quotas separately.
3. App performs configured search and captures available source name, publication date, evidence passage, and a non-clickable source identifier.
4. Each finding is presented individually with evidence and uncertainty.
5. User chooses Accept, Reject, Edit, or Unresolved for each finding.
6. App previews selected findings and shows how they would affect the analysis.
7. User approves integration.
8. Integration creates a **new research-informed analysis version**; previous analysis remains identifiable and unchanged.
9. User approves the new analysis version before downstream use.
10. App suggests the next function, but waits for the user to start it manually.

## No-clickable-link rule
No clickable links anywhere, including research UI, generated content, and exports. Source names, publication dates, evidence passages, URLs as plain non-clickable text where needed, and internal identifiers may be shown for provenance. UI must not render these as anchors or clickable controls.

## Evidence and conflict rules
- Do not automatically accept every finding.
- Do not automatically resolve contradictory claims.
- Keep accepted, rejected, edited, and unresolved states.
- Do not conflate a research source's claim with established fact.
- Show publication date when available and preserve the exact evidence passage when possible.
- Source quality checks are basic; the baseline does not require that only a predefined authoritative-source list be searched.

## Quotas, pause/resume, and model selection
- Smart default source/search limits; advanced settings may adjust limits.
- Respect actual provider limits and free-tier terms.
- When quota is exhausted, save partial progress where possible, show completed/pending work, pause, and allow manual resume.
- Never switch to a paid model/provider automatically.
- Exclude models with unknown pricing by default.
- Search availability and AI-model availability are separate dependencies.
- User may override the default eligible free model manually.

## Acceptance criteria
- AC-RS-01: Research is off by default.
- AC-RS-02: Quick, Deep, Adaptive modes are available when supported.
- AC-RS-03: Each finding has an individual review state.
- AC-RS-04: Integration requires preview and explicit approval.
- AC-RS-05: Integration creates a new analysis version.
- AC-RS-06: No clickable links anywhere.
- AC-RS-07: Quota exhaustion pauses safely and preserves partial progress where feasible.
- AC-RS-08: No paid fallback.
- AC-RS-09: After approval, next function is suggested but not auto-started.

## Hinglish
Research optional hai aur default OFF. Har finding ko user alag approve/reject/edit/unresolved karega. Integration se naya analysis version banega; purana overwrite nahi hoga. Koi clickable link nahi hoga.
