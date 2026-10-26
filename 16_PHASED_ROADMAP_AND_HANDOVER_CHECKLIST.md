# 16. Phased Roadmap & Developer Handover Checklist

## Roadmap principle
Implement and validate the factual foundation first, then add downstream production functions. Every phase must have testable acceptance criteria; do not start the next phase while critical gates fail.

## Phase 0 — Technical discovery and free-tier validation
**Deliverables**
- Compare candidate hosting/backend, database, auth, AI providers, search providers, and storage.
- Verify current free-tier eligibility, quotas, data terms, API-key protection, and limits.
- Validate Google Flow prompt requirements and target workflow.
- Define supported source types, max file size/source length, URL extraction limitations, retention, and backup formats.
- Document architecture decision record with costs and fallback behavior.
**Gate:** No mandatory paid dependency; protected secrets feasible; limitations documented.

## Phase 1 — Source Analysis Lab
**Deliverables**
- Source intake and preservation.
- Fixed 10-section analysis.
- Evidence statuses and claim records.
- Human editing and approval.
- Source/analysis versioning.
- Initial 20-source benchmark and quality scorecard.
**Gate:** No downstream generation from unapproved analysis; high-impact unsupported claims fail tests; schema and version integrity validated.

## Phase 2 — Core production workflow
**Deliverables**
- Function 00 complete.
- Function 01 script generation.
- Function 02 Flow prompt generation.
- Function 03 thumbnail prompts A/B.
- Function 04 SEO.
- Draft/review/approved/superseded states.
- Manual start of each downstream function.
**Gate:** Function-level acceptance tests pass; output links absent; approved analysis version used throughout.

## Phase 3 — Provider manager and security
**Deliverables**
- Per-function provider/model assignment.
- Connection/model tests, timeouts, bounded retries, cooldowns.
- Eligible-free model selection and free-only fallback.
- Secret handling, masking, redaction, authentication/access control as applicable.
**Gate:** No secret leakage; no unknown-price default; no paid fallback.

## Phase 4 — Project memory and versioning
**Deliverables**
- Project isolation.
- Master Rules versioning and explicit migration.
- Output history and source-version relationships.
- Eight-project limit and safe archive/export/delete flow.
**Gate:** No silent overwrite/deletion; prior approved versions identifiable; failed export blocks deletion.

## Phase 5 — Optional Research
**Deliverables**
- Research OFF by default.
- Quick/Deep/Adaptive modes.
- Finding review and integration preview.
- New analysis version creation and manual next-function start.
- Quota pause/resume.
**Gate:** Per-finding approval and no-clickable-link rules pass.

## Phase 6 — Backup, offline drafts, and restore
**Deliverables**
- Autosave states.
- Local draft/cache where feasible.
- Markdown/TXT/JSON/project export where supported.
- Restore validation, preview, conflict handling, secret exclusion.
**Gate:** Restore tests pass; no cloud overwrite by default; secrets absent from export.

## Phase 7 — UX, accessibility, release hardening
**Deliverables**
- Responsive desktop/tablet/mobile navigation.
- Bilingual UI.
- Meaningful dashboard/progress/error states.
- Accessibility and cross-device checks.
- Release checklist and known-limitations document.
**Gate:** All critical/high tests resolved; no feature is represented as verified unless it has been tested.

## Developer handover checklist
### Requirements
- [ ] Read PRD and all function specifications.
- [ ] Preserve confirmed decisions; do not reinterpret silently.
- [ ] Review `decision_register.json` and traceability CSV.
- [ ] Keep unresolved technical choices visible.

### Architecture / cost
- [ ] Record selected hosting/backend/database/auth providers.
- [ ] Verify current free tiers and data terms on selection date.
- [ ] Document hard limits and pause behavior.
- [ ] Confirm no paid resources or billing are enabled automatically.

### Security
- [ ] API keys protected server-side.
- [ ] Secret redaction tests pass.
- [ ] Project isolation and session tests pass where applicable.
- [ ] Backup excludes secrets.
- [ ] No clickable links in app/research/output/export.

### Workflow
- [ ] Source Analysis has fixed 10 sections.
- [ ] Analysis approval gates downstream functions.
- [ ] Every output records analysis and rules version.
- [ ] Research is OFF by default and separate.
- [ ] Research integration creates a new analysis version.
- [ ] No automatic next-function generation.

### Storage and recovery
- [ ] Autosave state truthful.
- [ ] Export/restore preview works.
- [ ] Failed export prevents deletion.
- [ ] Ninth-project flow follows confirmation requirements.
- [ ] Master Rules/provider settings survive project deletion.

### Testing and release
- [ ] 20 benchmark sources with human answer keys prepared.
- [ ] Quality metrics measured; high-impact errors fail.
- [ ] Critical security/version/cost tests pass.
- [ ] Desktop/tablet/mobile and Hindi/English smoke tests pass.
- [ ] Current AI disclosure/platform policy checked before release.
- [ ] Known limitations and operational handover supplied.

## Hinglish
Pehle free-tier aur architecture verify karo. Phir Source Analysis Lab aur 20-source testing. Uske baad script/Flow/thumbnail/SEO, phir provider-security, memory-versioning, research, backup aur UI polish. Har phase ke acceptance gate ke bina next phase ko complete mat bolo.
