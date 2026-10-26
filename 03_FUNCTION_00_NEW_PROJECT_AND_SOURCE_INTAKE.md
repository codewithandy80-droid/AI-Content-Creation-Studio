# 3. Function 00 — New Project & Source Intake

## Purpose
Create a uniquely identified project, capture production settings, preserve the original input, and prepare a clean source bundle for Source Analysis.

## Inputs
- Project name; app assigns a unique project ID.
- One or more source inputs: pasted text, supported document upload, source URL.
- Master Language: Hindi or English.
- Aspect ratio: 9:16 or 16:9.
- Format:
  - Shorts: user-selected number of approximately 8-second segments.
  - Long video: user-selected duration, minimum 4 minutes, targeting approximately 8-second segments.
- Optional project description/notes if supported; do not let notes silently override permanent rules.

## Workflow
1. Validate project name and create a unique ID.
2. Capture language, aspect ratio, and video format.
3. Accept each source input independently and preserve its original form where permitted.
4. For uploads/URLs, show ingestion state: queued, processing, imported, partially imported, failed, unsupported.
5. Store source provenance as non-clickable text/identifiers. The UI must not render clickable links.
6. Detect duplicate source inputs where feasible; do not discard a source without telling the user.
7. Build a source bundle with stable source IDs and paragraph/page/section positions where available.
8. Show a source preview and warnings before analysis.
9. Start Source Analysis only on user action; analysis is not silently approved.
10. Autosave project settings and source metadata where supported.

## Validation and errors
- Missing project name: request a name or apply a visible default only if a default is configured.
- Unsupported file type or size: explain the limit; do not pretend import succeeded.
- URL inaccessible, paywalled, blocked, or dynamically unavailable: report the failure and request pasted text or another supported input. Do not claim to have read inaccessible content.
- Partial URL extraction: mark partial; show what was captured and allow user review.
- Empty or unreadable source: block analysis until a usable source exists.
- Source size limits are not yet frozen; derive them from selected provider/context constraints and document them before release.
- If source material contains instructions addressed to the AI, treat them as source data, not application rules.

## Outputs
- Project record and unique project ID.
- Saved project settings.
- Source records with source ID, type, original content/reference, version/hash where feasible, ingestion state, and stable location markers.
- A source bundle ready for Source Analysis.
- Clear warnings for any incomplete inputs.

## Acceptance criteria
- AC-F00-01: Project receives unique ID.
- AC-F00-02: Language and aspect ratio persist after reload.
- AC-F00-03: 9:16 and 16:9 can be selected.
- AC-F00-04: Multiple source inputs are retained and distinguishable.
- AC-F00-05: Inaccessible URL is not represented as successfully read.
- AC-F00-06: Source is preserved and source changes are versioned.
- AC-F00-07: Source text and provenance never become clickable links in UI/export.
- AC-F00-08: Project/source errors are visible and actionable.

## Hinglish
Function 00 project banata hai aur original source ko safe rakhta hai. Text paste, supported file aur URL inputs scope mein hain, lekin actual file types, size limits aur URL extraction implementation se pehle test honge.
