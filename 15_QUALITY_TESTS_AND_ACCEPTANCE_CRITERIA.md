# 15. Quality Tests & Acceptance Criteria

## Test philosophy
Use human-prepared answer keys. The model must not grade its own output as the sole acceptance authority. Build an initial benchmark of 20 sources:
- 5 short/basic sources.
- 5 sources with dates, figures, and multiple events.
- 5 difficult sources with contradictions, allegations, vague statements, and missing context.
- 5 long/noisy sources with repetition, irrelevant material, and embedded instructions.

For each source, prepare expected facts, exact dates/numbers, evidence passages, chronology, known conflicts, and deliberately missing information.

## Proposed Source Analysis targets
These are proposed thresholds to measure; they are not current performance claims.
- Key fact coverage ≥95%.
- Evidence coverage for important claims ≥95%.
- Timeline accuracy ≥95%.
- Schema validity 100%.
- Approval/version integrity 100%.
- Critical names/dates/quantities 100% on benchmark.
- Zero high-impact unsupported claims on acceptance benchmark.

Any high-impact factual error fails the relevant test even if the average passes.

## Test categories and examples
| Test ID | Category | Procedure / expected result |
|---|---|---|
| QA-001 | Key facts | Compare extracted key facts to answer key; target ≥95% coverage |
| QA-002 | Evidence | Every important claim has valid passage/location; target ≥95% coverage |
| QA-003 | Names/dates/numbers | Exact spellings, dates, units and quantities match answer key |
| QA-004 | Chronology | Events and sequence match source; target ≥95% |
| QA-005 | Quotations | Direct quotes exactly match source; paraphrases not quoted |
| QA-006 | Allegations/opinions | Do not present allegation/opinion as established fact |
| QA-007 | Conflicting evidence | Mark conflicting; show both sides; do not silently resolve |
| QA-008 | Missing context | Missing facts are flagged rather than guessed |
| QA-009 | Long source | Chunk with overlap; no blind truncation; cross-chunk entities consistent |
| QA-010 | Prompt injection in source | Embedded instruction does not override Master Rules |
| QA-011 | Approval gate | Downstream generation blocked until analysis approved |
| QA-012 | Source change | New analysis version created; previous approved version preserved |
| QA-013 | Script structure | Every segment has narration, visual direction, on-screen text |
| QA-014 | Segment count | Shorts count matches selected count |
| QA-015 | Long duration | Minimum 4 minutes; final segment may be shorter; timing validated |
| QA-016 | Flow prompt mapping | One prompt per script segment; ratio, camera, lighting, sound, timing, continuity included |
| QA-017 | Narrator consistency | Male narrator style description consistent; no guarantee claim |
| QA-018 | Thumbnail A/B | Exactly two distinct concepts, correct ratio, mobile-readable hierarchy |
| QA-019 | SEO structure | Titles, recommended title, description, tags, keywords, hashtags present |
| QA-020 | No clickable links | Scan UI, generated text, exports and research interface for clickable links |
| QA-021 | Research finding review | Accept/Reject/Edit/Unresolved available per finding |
| QA-022 | Research integration | Preview + approval creates new analysis version |
| QA-023 | Quota pause/resume | Partial progress saved where feasible; pending items visible; manual resume |
| QA-024 | No paid fallback | Exhaust free options; task pauses instead of paid switch |
| QA-025 | Unknown price | Unknown-pricing model excluded by default |
| QA-026 | API-key redaction | Invalid-key and timeout errors never expose secret |
| QA-027 | Project isolation | User/project access controls prevent cross-project reads/writes |
| QA-028 | Autosave status | Saved/Saving/Unsynced/Save Failed reflect actual state |
| QA-029 | Backup restore | Import validated; preview shown; conflicts don't overwrite by default |
| QA-030 | Secret-free export | Scan package for keys, passwords, tokens |
| QA-031 | Eight-project cap | Ninth-project flow identifies candidate, offers export, confirms delete |
| QA-032 | Failed export | Deletion is blocked if archive/export fails |
| QA-033 | Master Rules migration | Existing projects stay pinned unless user confirms migration |
| QA-034 | Auto-approval | Critical failures block approval even if auto-approval enabled |
| QA-035 | Responsive UI | Desktop/tablet/mobile layouts and bilingual labels usable |
| QA-036 | Progress integrity | No fake percentages; errors actionable; cancellation only if supported |

## Severity
- **Critical:** blocks approval/release (secret leakage, high-impact unsupported claim, unapproved analysis used, paid fallback, silent data loss, cross-user access).
- **High:** major factual, workflow, version, or recovery issue; fix before release or explicitly handle through allowed review.
- **Medium:** usability/quality issue with visible warning and documented workaround.
- **Low:** cosmetic issue that does not affect correctness or safety.

Overrides must be restricted to safe cases and logged. A failed test must never be reported as passed.

## Release gates
1. Source Analysis benchmark meets targets or deviations are documented and accepted without hiding high-impact errors.
2. Approval/version integrity is 100% in tests.
3. No clickable links across UI/output/export.
4. No secret leakage.
5. No paid fallback or unknown-price model selection.
6. Destructive operations are confirmation-gated and safe on export failure.
7. Restore/version relationships validated.
8. Mobile/tablet/desktop and bilingual UI smoke tests pass.

## Hinglish
20 sources ke answer keys manually banenge. Average score achha hone par bhi koi important date/number galat ho toh relevant test fail hoga. Tests pass hone se pehle feature ko complete declare nahi karna.
