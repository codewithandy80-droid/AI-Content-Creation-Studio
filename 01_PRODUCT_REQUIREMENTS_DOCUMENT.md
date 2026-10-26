# 1. Product Requirements Document (PRD)

## 1.1 Product summary
Build a responsive web application that turns user-provided source material into a reviewed, source-grounded YouTube content production workflow. It should preserve the original source, create a structured analysis, require approval, and then provide script, Google Flow prompt, thumbnail prompt, and SEO functions.

**Product concept:** AI Content Creation App / AI YouTube Content Production Studio.

**Core principle:** Source Analysis is the factual foundation. Every downstream output must reference the exact approved analysis version used.

## 1.2 Goals
- Preserve supplied source material and its versions.
- Extract key facts, chronology, entities, figures, uncertainty, conflicts, and missing context with evidence.
- Make the user review and approve the analysis before downstream generation.
- Generate aligned script segments, matching video prompts, two thumbnail prompt concepts, and SEO assets.
- Keep reusable Permanent Master Rules separate from project-specific memory.
- Offer optional external research with finding-by-finding human review.
- Support free-tier-only operation intent, with clear pauses when free resources are unavailable.
- Protect secrets, prevent cross-project data mixing, and avoid silent deletion or overwrite.
- Provide usable bilingual UI and responsive desktop/tablet/mobile layouts.

## 1.3 Non-goals for this documentation baseline
- Writing application code, building, or deploying the app.
- Guaranteeing that any third-party service will remain free.
- Guaranteeing YouTube rankings, views, virality, or exact AI-generated visual/audio results.
- Generating thumbnail images inside Function 03 by default.
- Automatically fact-checking the source during Source Analysis.
- Automatically starting the next generation function after approval.
- Claiming a final hosting stack, database, auth provider, or AI model before validation.

## 1.4 Users and access model
The source establishes a personal content-production workflow and future developer handover, but does not conclusively freeze single-user versus multi-user product scope. Start architecture evaluation with per-user data isolation as a security requirement; record final account/product scope as `VALIDATE BEFORE BUILD`. If login is included, email/password and Google Sign-In are conditional on a suitable verified free-tier auth service.

## 1.5 Main workflow
1. Create project, set name, Master Language, aspect ratio, format/duration/part count, and add one or more sources.
2. Preserve source and source version; report unsupported or inaccessible inputs honestly.
3. Run source-only analysis with fixed 10-section report.
4. User reviews, edits, and approves an analysis version.
5. User manually starts Script Generation.
6. User reviews/edits/approves the script.
7. Generate one Google Flow prompt per script segment.
8. Generate thumbnail prompt options A and B.
9. Generate YouTube SEO assets.
10. Optionally enable Research, review each finding, preview selected findings, and approve integration into a new analysis version.
11. Use autosave where supported, version history, manual export, and safe restore.

Research is a separate optional stage, OFF by default. It must not silently replace the original source or the approved analysis.

## 1.6 Five core functions
- **Function 00 — New Project & Source Intake:** project identity, source intake, language, aspect ratio, duration/segment configuration.
- **Function 01 — Script Generation:** source-grounded narration, visual direction, and on-screen text for each segment.
- **Function 02 — Google Flow Video Prompts:** one detailed prompt per script segment, including timing, camera, lighting, sound, continuity, ratio, and narrator-style instructions.
- **Function 03 — Thumbnail Prompts:** two distinct prompt options A/B; prompt-only by default.
- **Function 04 — YouTube SEO:** title options plus recommended title, description, tags, keywords, hashtags, and title/thumbnail alignment checks.

## 1.7 Global product rules
- Master Language is Hindi or English and governs all project outputs unless a specific output-format rule says otherwise.
- Aspect ratio is 9:16 or 16:9.
- Shorts use user-selected count of approximately 8-second segments.
- Long video duration is at least 4 minutes; target segment duration is approximately 8 seconds. The final segment may be shorter to meet the requested total duration.
- Output statuses include Draft, In Review, Approved, and Superseded.
- Optional auto-approval may be enabled for selected output types, but critical quality failures still block approval.
- No clickable links anywhere in the app, research UI, generated content, or exports.
- A consistent male narrator's voice/delivery should be described in prompts; prompt text alone cannot guarantee identical voice/audio.
- No paid fallback; if all eligible free providers are unavailable, pause the task.
- Project limit is eight. On a ninth project, identify the oldest project, show affected data, offer archive/export, and request explicit deletion confirmation before deleting. Do not delete if archive/export fails.
- Permanent Master Rules and provider settings are not deleted when a project is deleted.

## 1.8 Functional requirements
See Function 00–04 specifications and Source Analysis/Research specifications. Every function must support input validation, clear task state, save status, errors, manual editing where applicable, and version-aware output records.

## 1.9 Non-functional requirements
- **Accuracy:** evidence-first source analysis; high-impact unsupported claims fail acceptance.
- **Integrity:** no downstream use of unapproved analysis; output records the exact analysis/rules version.
- **Security:** API secrets never appear in frontend bundles, URLs, logs, analytics, prompts, generated output, backups, or version history.
- **Reliability:** bounded retries, timeouts, cooldowns, pause/resume when possible.
- **Usability:** responsive bilingual UI; accessible labels and usable mobile editing.
- **Cost control:** free-tier-only intent; unknown pricing excluded by default; no silent paid resource or billing activation.
- **Data safety:** no silent overwrite/deletion; restore preview and conflict handling.
- **Transparency:** do not claim unsupported features, successful saves, or test passes without evidence.

## 1.10 Acceptance summary
Release readiness requires passing critical security, source-fidelity, approval/version-integrity, no-clickable-link, no-paid-fallback, destructive-action confirmation, and backup/restore tests. Proposed Source Analysis numeric targets are listed in the quality plan and must be measured; they are not claimed as already achieved.

## 1.11 Hinglish explanation
App ka flow simple hai: pehle source add hoga, phir uska evidence-based analysis banega. User analysis approve karega, tabhi script aur baaki content banega. Research optional hai. Data, versions aur API keys ko safe rakhna aur paid service ko chupke se use na karna mandatory rules hain.
