# 13. Project Memory, Versioning, Backup & Restore

## Data separation
- **Permanent Master Rules:** reusable instructions and templates shared across projects; versioned independently.
- **Project memory:** source, source versions, analysis versions, script decisions, prompts, thumbnails, SEO, research findings, approvals, and task metadata for one project.
- **Provider settings:** separate from project data; deleting a project must not delete them.
- **No cross-project mixing:** every project-scoped record must reference a project ID and access checks must enforce that boundary.

## Master Rules versioning
- New projects use the latest Master Rules by default.
- Existing projects retain the rules version recorded at project creation/output generation.
- Offer optional notification and manual migration route.
- Migration requires a change preview and explicit confirmation.
- Never silently regenerate or overwrite approved outputs because rules changed.
- Record the rules version on every generated output.

## Source and output versions
- Source change creates a new source version and triggers new analysis.
- New analysis remains pending until reviewed/approved.
- Until approval, downstream functions continue using the previous approved analysis version.
- Each output records its source/analysis/rules versions and status.
- Editing an approved output creates a new version; prior approved version remains identifiable.
- Statuses: Draft, In Review, Approved, Superseded.
- History/restore must respect actual retention limits; never promise indefinite history.

## Autosave and local drafts
- Auto-save where supported.
- Display Saved, Saving, Unsynced, or Save Failed.
- Use local drafts/cache where technically feasible; mark unsynced changes.
- AI generation requires a connection to an available provider.
- Detect sync conflicts and show a resolution flow; do not silently choose one version when data may be lost.
- Cloud save is not an independent backup.

## Manual export
Required target formats where technically supported:
- Markdown (`.md`)
- Plain text (`.txt`)
- JSON (`.json`)
- Complete project package including source references/IDs, version metadata, approvals, settings that are safe to export, and related outputs.

Never export API keys, passwords, session tokens, or secrets. No clickable links in exported content. Provenance must be plain text/non-clickable identifiers.

## Safe restore
1. Validate file type/schema and size.
2. Scan/validate imported structure before applying.
3. Show a preview of projects, versions, and records to be created/replaced.
4. Default to non-destructive import or import-as-new-project when conflicts exist.
5. Do not overwrite cloud project by default.
6. Merge only if technically supported and deterministic; otherwise offer restore or import as new project.
7. Require explicit confirmation for replacement.
8. Verify restored version relationships and secret exclusion.
9. Report partial failure clearly; do not claim full restore if records are missing.

## Eight-project limit and deletion
- Maximum active project count: eight.
- When a ninth project is created, identify the oldest candidate and show both creation and last-activity timestamps where available.
- Offer archive/export first and show export result.
- Require explicit deletion confirmation.
- If archive/export fails, stop; do not silently delete.
- Delete only the selected project's related data: sources, analysis, scripts, prompts, thumbnails, SEO, research findings, and project version metadata as scoped.
- Preserve Permanent Master Rules and provider settings.
- Exact “oldest” ordering basis (creation date versus last activity) is not fully frozen; implementation should make the criterion visible and document the selected rule before release.

## Hinglish
Project memory alag rahegi; Master Rules alag. Naye rules purane projects par apne aap apply nahi honge. Export mein secrets nahi honge. Restore se pehle preview aur confirmation chahiye. 9th project par archive/export aur explicit delete confirmation ke bina data delete nahi karna.
