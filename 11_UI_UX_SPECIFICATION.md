# 11. UI/UX Specification

## Design principles
- Bilingual app interface (Hindi/English) independent of each project's Master Language.
- Keep the main workflow guided and visible, but separate advanced settings from everyday actions.
- Show meaningful status, not fake precision.
- Use confirmations for destructive actions and major version changes.
- Avoid clickable links throughout the app, including source URL text; render provenance as plain non-clickable text/IDs.

## Navigation
- **Desktop:** sidebar navigation and workspace panels.
- **Mobile:** bottom navigation for primary areas plus compact/hamburger menu for less-used sections.
- **Tablet:** adaptive navigation and responsive workspace.
- Ensure script editor remains readable on small screens.

## Required screens
1. **Project Dashboard:** recent projects, New Project, progress, pending approvals, failed tasks, provider/free-model health, quick actions.
2. **New Project:** project name, language, ratio, Shorts/long format, duration/segment count, multiple source inputs.
3. **Source Intake Review:** imported source list, extraction status, source preview, unsupported/inaccessible warnings.
4. **Source Analysis Review:** 10 report sections, claim evidence, status, inline edits, conflicts, approve/reject/edit controls.
5. **Project Workspace:** stages for Analysis, Script, Flow Prompts, Thumbnail, SEO, optional Research; clear dependency locks.
6. **Script Editor:** segment navigation, narration, visuals, on-screen text, direct editing, AI-assisted editing at selected-text/segment/full-output scope.
7. **Prompt Cards:** one Flow prompt per segment, copy individual prompt, copy/export full set; thumbnail A/B cards.
8. **SEO Editor:** title options, recommended title, description, tags, keywords, hashtags, factual consistency warnings.
9. **Research Review:** Quick/Deep/Adaptive, finding-by-finding Accept/Reject/Edit/Unresolved, evidence text, date/name/non-clickable identifiers, integration preview.
10. **Master Settings:** permanent rules, versions, defaults, language, aspect ratio, segment preferences, narrator/visual profiles.
11. **Provider Manager:** provider/model mapping by function, eligible-free status, tests, quotas where available, priority/fallback.
12. **Backup & Restore:** export, import validation, restore preview, conflict resolution, storage warning.
13. **Project Archive/Delete:** oldest candidate details, export/archive result, explicit deletion confirmation.

## Statuses and progress
- Output status: Draft, In Review, Approved, Superseded.
- Save state: Saved, Saving, Unsynced, Save Failed.
- Task state should include queued/running/succeeded/failed/paused/cancelled where technically supported.
- Show current function, completed steps, blocked dependencies, provider/model status, and actionable errors.
- Estimate progress only when the estimate is meaningful. Do not show fabricated percentages.
- Support cancellation where underlying operation permits it.

## Interaction rules
- Analysis approval gates downstream functions.
- Ordinary generation can be one click when dependencies are satisfied.
- Destructive actions, source changes, restore, Master Rules migration, and project deletion require confirmation.
- Editing an approved output creates a new version.
- Optional auto-approval must clearly show which output types it affects and never bypass critical gates.
- After research integration approval, suggest next function but wait for manual start.

## Accessibility
- Readable text and contrast.
- Keyboard-operable controls where feasible.
- Labels for buttons and status icons.
- Clear focus states and form validation.
- Touch targets suitable for mobile.
- Do not rely on colour alone to communicate conflict/error/approval.

## Hinglish
Dashboard par user ko pata chale ki project kis stage par hai, kya approval pending hai, aur provider available hai ya nahi. Mobile par primary navigation bottom mein; desktop par sidebar. Error ya save failure ko clearly dikhana hai.
