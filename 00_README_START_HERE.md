# AI Content Creation App — Developer Documentation Package

**Version:** 1.0  
**Baseline date:** 26 October 2026  
**Status:** Requirements consolidated; implementation has not started.  
**Language:** Main technical specification in English, with Hindi/Hinglish explanations where helpful.

## Purpose
This package converts the decisions and requirements in the uploaded conversation export into a structured developer handover. It is a specification package only: no code, application build, deployment, provider activation, or live-service verification has been performed.

**Source reviewed:** `ChatGPT-हिंदी रील स्क्रिप्ट-20261026-2242.txt` (uploaded conversation export). Requirements in this package are grounded in that file. Where a point is technically dependent on a future service or was not concretely selected, it is marked `VALIDATE BEFORE BUILD`, `OPEN / PENDING`, or `PLANNED` rather than invented as a finalized choice.

## Read in this order
1. `01_PRODUCT_REQUIREMENTS_DOCUMENT.md` — product scope and workflow.
2. `02_DECISION_AND_REQUIREMENT_REGISTER.md` and `decision_register.json` — chosen requirements and status labels.
3. `03_FUNCTION_00_NEW_PROJECT_AND_SOURCE_INTAKE.md`
4. `04_FUNCTION_01_SCRIPT_GENERATION.md`
5. `05_FUNCTION_02_GOOGLE_FLOW_PROMPTS.md`
6. `06_FUNCTION_03_THUMBNAIL_PROMPTS.md`
7. `07_FUNCTION_04_YOUTUBE_SEO.md`
8. `08_SOURCE_ANALYSIS_SPECIFICATION.md`
9. `09_OPTIONAL_RESEARCH_SPECIFICATION.md`
10. `10_PERMANENT_MASTER_RULES.md`
11. `11_UI_UX_SPECIFICATION.md`
12. `12_PROVIDER_FREE_TIER_AND_API_KEY_RULES.md`
13. `13_MEMORY_VERSIONING_BACKUP_AND_RESTORE.md`
14. `14_SECURITY_THREAT_MODEL_AND_RISK_REGISTER.md`
15. `15_QUALITY_TESTS_AND_ACCEPTANCE_CRITERIA.md`
16. `16_PHASED_ROADMAP_AND_HANDOVER_CHECKLIST.md`
17. `17_GLOSSARY_AND_DATA_STRUCTURES.md`
18. `requirement_traceability.csv` — requirement → test → phase mapping.

## Status vocabulary
- **CONFIRMED** — explicitly selected or approved in the source conversation.
- **PROPOSED — NOT YET APPROVED** — a suggested approach that the source does not establish as a final user choice.
- **OPEN / PENDING** — a genuine unresolved product/implementation detail.
- **VALIDATE BEFORE BUILD** — depends on current provider terms, architecture, or technical feasibility.
- **PLANNED** — included in the roadmap but not implemented or verified.

## Hard constraints
- Free-tier-only product intent: no mandatory paid service, no automatic paid fallback, and no silently enabled billing.
- Do not silently overwrite approved outputs, silently delete project data, or apply new Master Rules to existing projects without user confirmation.
- Source Analysis is source-only; external research is a separate optional stage and is OFF by default.
- No clickable links anywhere in the app interface, research interface, generated content, or exports. Source provenance may be stored as non-clickable text/identifiers.
- The five core functions are Function 00 New Project/Source Intake, Function 01 Script Generation, Function 02 Google Flow Video Prompts, Function 03 Thumbnail Prompts, and Function 04 YouTube SEO.
- The user approves Source Analysis before downstream generation. After research integration is approved, the app suggests a next step but waits for the user to start it.
- Thumbnail function produces prompts, not generated images, by default.
- Documentation does not claim that planned features are built, tested, secure, or currently available.

## Important implementation boundary
Hosting/backend, authentication service, database, exact model/provider mapping, quotas, source-size limits, retention limits, and Google Flow compatibility are not frozen. Evaluate them against current terms and measurable constraints before implementation. If a required capability cannot be delivered on verified free resources, report that limitation and pause/disable that capability rather than quietly introducing a cost.

## Hinglish summary
Yeh developer ko dene ke liye complete planning baseline hai. Confirmed rules ko change nahi karna; jo technical cheezein provider ya architecture par depend karti hain unko build se pehle verify karna hai. ZIP documentation hai—app abhi build ya deploy nahi hui.
