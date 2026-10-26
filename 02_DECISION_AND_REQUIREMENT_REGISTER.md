# 2. Decision & Requirement Register

## Status key
- **CONFIRMED** — explicit final choice in the uploaded conversation.
- **VALIDATE BEFORE BUILD** — implementation/provider-dependent.
- **OPEN / PENDING** — not conclusively selected in the source.
- **PLANNED** — roadmap item, not implemented.

## Confirmed baseline decisions
| ID | Decision / requirement | Status |
|---|---|---|
| DEC-001 | Responsive web app | CONFIRMED |
| DEC-002 | Five functions: New Project, Script, Google Flow Prompts, Thumbnail Prompts, SEO | CONFIRMED |
| DEC-003 | Source Analysis is source-only; no external fact-check in that stage | CONFIRMED |
| DEC-004 | Fixed 10-section Source Analysis report | CONFIRMED |
| DEC-005 | Evidence states: source-supported, unverified, conflicting | CONFIRMED |
| DEC-006 | Human approval of analysis required before downstream generation | CONFIRMED |
| DEC-007 | Hindi or English Master Language per project | CONFIRMED |
| DEC-008 | Aspect ratio 9:16 or 16:9 | CONFIRMED |
| DEC-009 | Shorts segment count selected by user; segments approx. 8 seconds | CONFIRMED |
| DEC-010 | Long video minimum 4 minutes; approx. 8-second segments; final segment may be shorter | CONFIRMED |
| DEC-011 | One separate Google Flow prompt per script segment | CONFIRMED |
| DEC-012 | Consistent male narrator style described in prompts; actual voice consistency not guaranteed by prompt alone | CONFIRMED / VALIDATE BEFORE BUILD |
| DEC-013 | Two distinct thumbnail prompt options A and B; prompts only by default | CONFIRMED |
| DEC-014 | SEO includes title options, recommended title, description, tags, keywords, hashtags | CONFIRMED |
| DEC-015 | No clickable links anywhere, including research interface and exports | CONFIRMED |
| DEC-016 | Research OFF by default; optional Quick, Deep, Adaptive modes | CONFIRMED |
| DEC-017 | Research findings individually Accept/Reject/Edit/Unresolved; preview before integration | CONFIRMED |
| DEC-018 | Research integration creates new analysis version; never overwrites prior approved version | CONFIRMED |
| DEC-019 | After research approval, suggest next function but wait for manual start | CONFIRMED |
| DEC-020 | No paid fallback; pause if eligible free choices unavailable | CONFIRMED |
| DEC-021 | Unknown pricing excluded by default; provider/model eligibility must be checked | CONFIRMED |
| DEC-022 | Max 8 projects; ninth-project flow includes oldest-project review, archive/export, explicit deletion confirmation | CONFIRMED |
| DEC-023 | Failed archive/export must prevent silent deletion | CONFIRMED |
| DEC-024 | Autosave where supported plus manual export/backup | CONFIRMED |
| DEC-025 | Free cloud storage warnings and export/cleanup; local drafts prioritized where supported | CONFIRMED / VALIDATE BEFORE BUILD |
| DEC-026 | Permanent Master Rules versioned; new projects use latest by default; existing projects retain recorded version unless user migrates | CONFIRMED |
| DEC-027 | Master Rule migration requires preview and confirmation; no silent regeneration/overwrite | CONFIRMED |
| DEC-028 | Optional per-output auto-approval setting; default outputs are Draft; critical quality failures block approval | CONFIRMED |
| DEC-029 | Desktop sidebar, mobile bottom navigation/compact menu, adaptive tablet layout | CONFIRMED |
| DEC-030 | Dashboard includes recent projects, workflow progress, approvals, failed tasks, provider status | CONFIRMED |
| DEC-031 | Direct editing and AI-assisted editing; revision scope can be selected text, segment, or full output | CONFIRMED |
| DEC-032 | API keys protected, masked, replace/delete controls; no secrets in logs, exports, prompts, history | CONFIRMED |
| DEC-033 | Provider examples include OpenRouter, Groq, Gemini, only subject to current compatibility and free-tier terms | VALIDATE BEFORE BUILD |
| DEC-034 | 20-source initial benchmark with human-prepared answer keys | PLANNED |
| DEC-035 | No code/build/deployment during this planning/documentation task | CONFIRMED |

## Technical questions that must not be falsely marked final
| ID | Question | Status / action |
|---|---|---|
| TECH-001 | Hosting/backend architecture capable of protected secrets, auth, storage, and workload within verified free limits | VALIDATE BEFORE BUILD |
| TECH-002 | Database and retention strategy | VALIDATE BEFORE BUILD |
| TECH-003 | Login scope and selected authentication provider | VALIDATE BEFORE BUILD |
| TECH-004 | Actual free models per function, quotas, rate limits, data terms | VALIDATE BEFORE BUILD |
| TECH-005 | Maximum source length/file size and supported document types | VALIDATE BEFORE BUILD |
| TECH-006 | URL ingestion coverage and handling of inaccessible pages | VALIDATE BEFORE BUILD |
| TECH-007 | Google Flow prompt format, supported ratios, model/version, and safety requirements | VALIDATE BEFORE BUILD |
| TECH-008 | Whether exact output export formats and restore fidelity can be implemented on selected stack | VALIDATE BEFORE BUILD |
| TECH-009 | Practical storage and version retention limits | VALIDATE BEFORE BUILD |
| TECH-010 | AI disclosure requirements at release time | VALIDATE BEFORE BUILD |
| TECH-011 | Exact SEO title-option count and description length/template | OPEN / PENDING; implement configurable defaults and validate with product owner if needed |
| TECH-012 | Exact maximum Shorts parts and maximum long-video duration | OPEN / PENDING; do not invent a hard cap before capacity testing |
| TECH-013 | Final project "oldest" ordering basis (creation date vs last activity) | OPEN / PENDING; show both timestamps and obtain explicit choice during implementation review if necessary |
| TECH-014 | Exact provider/database/hosting selections | OPEN / PENDING |

## Superseded planning questions
Earlier in the conversation, some questions were marked open (file upload, URL import, final segment duration, research links, etc.). The later final consolidation supersedes those earlier questions as follows: pasted text + supported uploads + URLs/multiple sources are in scope; final long-video segment may be shorter; no clickable links anywhere; research is optional and separate. Technical support for each input path remains subject to validation.

## Rule for developers
Do not silently reconcile or invent a product decision. Keep confirmed choices intact. For technical questions, propose a solution with cost/limit evidence, mark it for review, and never introduce paid dependencies without explicit authorization.

## Hinglish
Register mein “CONFIRMED” product decision hai; “VALIDATE BEFORE BUILD” ka matlab hai ki user se dobara product preference poochne ki zaroorat nahi, lekin implementation se pehle service/technical reality check karna hai.
