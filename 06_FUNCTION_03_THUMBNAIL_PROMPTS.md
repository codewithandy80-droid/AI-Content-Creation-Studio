# 6. Function 03 — Thumbnail Prompt Generation

## Purpose
Generate two meaningfully different thumbnail-image prompts, A and B, based on the approved project content. This function outputs prompts, not images, by default.

## Inputs
- Approved analysis and source-grounded script.
- Recommended title and/or relevant SEO context when available.
- Master Language.
- Project aspect ratio (9:16 for vertical Shorts/reels; 16:9 for landscape videos).
- Visual style and Permanent Master Rules version.

## Output
- **Option A — High-impact / suspenseful / dramatic concept.**
- **Option B — Mystery / discovery / cinematic storytelling concept.**
Each option must include a complete image-generation prompt and a short internal concept label.

## Prompt requirements
Specify:
- Main subject and focal point.
- Composition, subject placement, foreground/background hierarchy.
- Camera perspective and crop.
- Lighting, contrast, colour palette, atmosphere.
- Headline/text placement and mobile readability.
- Aspect ratio and safe space for platform UI where relevant.
- Accurate visual representation of the source; no unsupported real-world claim or misleading depiction.
- Negative constraints where useful (e.g., avoid clutter, illegible text, extra limbs, inconsistent subject details).
- Master Language for any requested visible text, unless the user explicitly edits it.
- Visual differentiation between A and B; they must not be minor variations of the same idea.

## Rules
- No clickable source links.
- Do not claim image creation happened; only prompts are generated.
- Avoid deceptive thumbnail instructions that contradict the source.
- Keep the title-thumbnail promise consistent with the approved story and SEO recommendation.
- Default outputs remain Draft; optional auto-approval applies only if enabled and quality gates pass.
- Preserve versions and record source analysis, script/title context, and rules version.

## Acceptance criteria
- AC-F03-01: Exactly two options A and B are produced.
- AC-F03-02: A and B have distinct visual concepts.
- AC-F03-03: Aspect ratio matches project settings.
- AC-F03-04: Mobile readability and text hierarchy are addressed.
- AC-F03-05: No clickable links appear.
- AC-F03-06: Prompts do not imply that image generation itself occurred.

## Hinglish
Thumbnail function do alag prompt concepts degi—A dramatic, B mystery/discovery style. Default mein image generate nahi hogi. Thumbnail ka promise story aur title se match karna chahiye.
