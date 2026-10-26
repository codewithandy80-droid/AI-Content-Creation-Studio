# 4. Function 01 — Script Generation

## Purpose
Generate a source-grounded YouTube/Shorts script from the exact approved Source Analysis version. The script must not invent facts or drift from the approved story.

## Preconditions
- Project has a source bundle.
- An analysis version exists and is approved.
- Master Language and format/duration settings are known.
- If Research has been used, only the approved research-informed analysis version may be selected.

## Inputs
- Exact approved analysis version ID.
- Original source references for traceability.
- Master Language.
- Shorts selected segment count, or long-video selected duration.
- Permanent Master Rules version and relevant project-specific notes.

## Per-segment output schema
Each segment should include:
1. Segment number and stable segment ID.
2. Target duration.
3. Story function/purpose (e.g., hook, setup, key development, consequence, ending).
4. Narration/voiceover text.
5. Visual direction.
6. On-screen text.
7. Transition/continuity note.
8. Evidence/source claim references internally as non-clickable IDs, where useful for review.
9. Quality warnings, if any.

The visible generated script must not include clickable source links. Internal IDs may be retained for traceability but must not render as links.

## Rules
- Use the selected Master Language consistently.
- Shorts: produce the selected number of approximately 8-second parts.
- Long video: minimum 4 minutes; target about 8 seconds per segment. The final segment may be shorter to match the selected total duration.
- Preserve names, dates, figures, units, attributions, chronology, and caveats.
- Distinguish allegation, opinion, prediction, and established fact.
- Do not turn unverified or conflicting claims into certain facts. Use careful phrasing or flag for user review.
- Do not add unsupported background or outside facts.
- Maintain a coherent hook, progression, and ending without distorting the source.
- A script is Draft by default. Optional auto-approval can apply only if explicitly enabled for this output type and all quality gates pass.
- Direct editing and AI-assisted revision should be possible for selected text, segment, or whole output.
- Every revision creates a new version; the prior approved version remains identifiable.
- Record analysis version, Master Rules version, model/provider metadata that is safe to retain, and approval status.

## Validation
- Segment count matches the selected count for Shorts.
- Long-video total target matches requested duration within the implementation's documented timing tolerance; final segment may be shorter.
- Narration length is plausible for the target duration; warn rather than silently claim exact runtime.
- All key factual statements map to approved analysis evidence or are explicitly marked as editorial framing.
- Language and required fields validate against schema.

## Acceptance criteria
- AC-F01-01: Script cannot generate from unapproved analysis.
- AC-F01-02: Every segment contains narration, visual direction, and on-screen text.
- AC-F01-03: Shorts segment count matches user selection.
- AC-F01-04: Long video respects ≥4-minute minimum and final-short-segment rule.
- AC-F01-05: Unsupported high-impact factual claim blocks approval.
- AC-F01-06: Output records exact analysis/rules versions.
- AC-F01-07: No clickable links appear in script or export.
- AC-F01-08: Editing creates a new version without erasing prior approved output.

## Hinglish
Script ko approved analysis se hi banana hai. Har part mein narration, visuals aur screen text honge. Facts ko dramatic banane ke liye badalna nahi hai; user edit kar sakta hai, aur approval/version history preserve hogi.
