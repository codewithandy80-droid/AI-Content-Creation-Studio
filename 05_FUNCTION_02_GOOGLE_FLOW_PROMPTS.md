# 5. Function 02 — Google Flow Video Prompts

## Purpose
Produce one separate, detailed video-generation prompt for every script segment, intended for the user's Google Flow workflow.

## Preconditions and inputs
- Approved script version.
- Exact segment list and each segment's timing.
- Project aspect ratio and Master Language.
- Permanent Master Rules version, visual style, continuity profile, narrator profile, and sound/music profile where configured.
- Relevant source/analysis context for factual consistency.

## Required prompt content
Each prompt should clearly specify:
- Segment ID and target duration.
- Aspect ratio (9:16 or 16:9).
- Main subject, setting, action, and scene composition.
- Camera framing, movement, lens/shot feel where useful.
- Lighting, palette, atmosphere, cinematic detail.
- Time/action progression and scene timing.
- Continuity links to prior/next segment: characters, wardrobe, location, props, visual style.
- Music and sound effects where appropriate.
- Narration guidance describing a consistent male narrator's voice character, pace, tone, and delivery.
- Safety/policy-aware instructions relevant to the chosen scene.
- Negative constraints where useful to avoid common visual errors, while respecting the actual tool's prompt syntax.

## Rules
- One prompt per script segment; do not combine segments into one prompt unless a future user-selected export explicitly requests a combined view.
- Keep prompts factually aligned with the approved script and analysis.
- No clickable links or source URLs in prompts.
- Technical prompt language may be English if this improves tool usability; narration and on-screen wording must follow the project's Master Language where applicable. This is a practical default to validate in testing, not a guarantee about Flow.
- Describe a consistent male narrator, but do not promise identical generated voice or audio across segments unless a verified external workflow provides that.
- Prompt text cannot guarantee exact duration, voice identity, continuity, or final image fidelity. Show this limitation clearly.
- Default output is text prompts; actual video generation by Google Flow is outside this function unless separately integrated and validated.
- Editing/revising prompts creates a new version and preserves previous approved prompts.
- Prompt output begins as Draft unless eligible auto-approval is enabled and all quality gates pass.

## Error handling
- Missing script segment: block that segment's prompt and show the mismatch.
- Unsupported aspect ratio or changed Flow capabilities: warn and provide the closest documented prompt only if user chooses; do not claim compatibility without validation.
- Provider/model unavailable: pause or use an eligible free fallback; never paid fallback.
- Quota exhaustion: save completed prompts, mark remaining prompts pending, and allow manual resume.

## Acceptance criteria
- AC-F02-01: Prompt count equals approved script segment count.
- AC-F02-02: Every prompt contains ratio, action, camera, lighting, timing, sound guidance, and continuity where relevant.
- AC-F02-03: Narrator style is described consistently across prompts.
- AC-F02-04: Prompts do not include clickable links.
- AC-F02-05: Flow compatibility limitations are documented and tested before release.
- AC-F02-06: Output records the script, analysis, and Master Rules versions used.

## Hinglish
Har script segment ke liye alag detailed Flow prompt. Male narrator ki style har prompt mein consistent describe hogi, lekin prompt se same exact voice guarantee nahi hoti. Google Flow ki current capabilities launch se pehle verify karni hain.
