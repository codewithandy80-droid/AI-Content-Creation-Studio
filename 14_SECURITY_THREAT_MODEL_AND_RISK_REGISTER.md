# 14. Security Threat Model & Risk Register

## Security goals
Protect API keys and credentials; prevent unauthorized project access and cross-project data leakage; preserve approved versions; avoid unsafe destructive actions; provide honest error/save status; and avoid false claims about service privacy or security.

## Threats and mitigations
| ID | Threat | Required mitigation / verification |
|---|---|---|
| SEC-01 | API key leaked in frontend bundle | Server-side secret handling; inspect build artifacts before release |
| SEC-02 | Secret appears in logs/errors/analytics | Central redaction; test with invalid key and provider errors |
| SEC-03 | Secret included in export/backup/history | Explicit secret exclusion; scan exported packages |
| SEC-04 | Cross-project data access | Project-scoped authorization checks on every read/write; isolation tests |
| SEC-05 | Unauthenticated session reuse | Secure session handling, logout, expiry and access tests if login exists |
| SEC-06 | Malicious instructions embedded in source | Treat source as data; do not allow source text to override Master Rules |
| SEC-07 | Source URL inaccessible but app claims success | Honest ingestion states; test blocked, partial, and inaccessible URLs |
| SEC-08 | Unapproved analysis used downstream | Hard dependency check on approved analysis version |
| SEC-09 | New Master Rules silently alter existing project | Version pinning, preview, explicit migration confirmation |
| SEC-10 | Restore overwrites valid cloud data | Preview, non-destructive default, explicit replacement confirmation |
| SEC-11 | Project deleted after failed export | Transactional delete flow; export success/verification gate |
| SEC-12 | Provider fallback incurs cost | Free-eligibility allowlist; unknown price excluded; paid fallback prohibited |
| SEC-13 | Provider terms or quotas change | Revalidate before activation; pause if no free option |
| SEC-14 | Research conflict silently resolved | Per-finding review and unresolved state |
| SEC-15 | Clickable links violate final rule | Render source references as plain text/IDs; test UI and exports |
| SEC-16 | Long-source truncation loses facts | Chunk with overlap, preserve locations, cross-chunk validation |
| SEC-17 | UI shows false progress/save success | State reflects actual operation; no fabricated percentages |
| SEC-18 | Sensitive source content sent to third party without awareness | Disclose chosen provider/data handling in product; verify terms before release |

## Data handling principles
- Minimize secrets and sensitive operational logs.
- Do not log raw API keys or credentials.
- Keep provider settings separate from project deletion.
- Use HTTPS for network traffic where applicable.
- Validate imported backup structure before restore.
- Maintain audit events for approval, migration, export, restore, and deletion without storing secrets.
- Avoid retaining more content than needed for documented workflow and version history.
- Data retention, encryption at rest, key vault, and authentication design depend on the selected architecture and must be validated before build.

## Release security gate
Do not release if:
- Any API key is visible in client artifacts, logs, exports, or history.
- A user can read/write another user's project in an authenticated build.
- Unapproved analysis can drive downstream generation.
- A paid model can be selected automatically.
- Restore/deletion can silently destroy data.
- Source links become clickable.
- Security claims exceed verified implementation.

## Hinglish
Security checklist ka main point: API key kabhi browser bundle, URL, log ya export mein nahi aani chahiye. Project data isolate ho, restore/delete safe ho, aur source ke andar likhe instructions app ke permanent rules ko override na karein.
