# 17. Glossary & Suggested Data Structures

These are implementation-neutral suggested structures, not a frozen database schema. Developers may adapt them to the selected database while preserving semantics and version relationships.

## Glossary
- **Master Language:** Hindi or English setting for a project’s generated content.
- **Permanent Master Rules:** reusable global instructions/templates, versioned independently of projects.
- **Project Memory:** source and project-specific approved decisions/output history.
- **Source-supported:** claim is supported by supplied source; not independently verified.
- **Unverified:** supplied source does not adequately establish claim.
- **Conflicting:** relevant source statements disagree.
- **Approved analysis:** user-reviewed analysis version permitted for downstream generation.
- **Research-informed analysis:** new analysis version created after selected external findings are reviewed and integrated.
- **Draft / In Review / Approved / Superseded:** output lifecycle statuses.
- **Free fallback:** another verified eligible free provider/model; never a paid fallback.
- **No clickable links:** source URLs/references may be stored as plain text/IDs but must not render as clickable controls.

## Suggested entities
### Project
- `project_id` (unique)
- `name`
- `created_at`
- `last_activity_at`
- `master_language` (`hi` / `en`)
- `aspect_ratio` (`9:16` / `16:9`)
- `format_type` (`shorts` / `long_video`)
- `shorts_segment_count` (nullable)
- `target_duration_seconds` (nullable)
- `master_rules_version_id`
- `active_approved_analysis_version_id` (nullable)
- `project_status`

### Source
- `source_id`
- `project_id`
- `source_type` (`pasted_text` / `upload` / `url`)
- `source_label`
- `source_version`
- `content_or_storage_reference`
- `source_hash` (if feasible)
- `ingestion_status`
- `captured_at`
- `non_clickable_provenance_text`
- `location_index_metadata`

### AnalysisVersion
- `analysis_version_id`
- `project_id`
- `source_version_ids`
- `version_number`
- `analysis_type` (`source_only` / `research_informed`)
- `report_schema_version`
- `claim_records`
- `created_at`
- `review_status`
- `approved_at` (nullable)
- `supersedes_analysis_version_id` (nullable)

### ClaimRecord
- `claim_id`
- `analysis_version_id`
- `claim_text`
- `status`
- `importance`
- `claim_type`
- `evidence_text`
- `source_id`
- `source_location`
- `attribution`
- `caveat`
- `review_status`

### GeneratedOutput
- `output_id`
- `project_id`
- `output_type` (`script` / `flow_prompt` / `thumbnail_prompt` / `seo`)
- `version_number`
- `status`
- `content`
- `analysis_version_id`
- `master_rules_version_id`
- `input_output_version_ids`
- `provider_id` and `model_id` (non-secret metadata only)
- `created_at`
- `approved_at` (nullable)
- `supersedes_output_id` (nullable)

### ResearchFinding
- `finding_id`
- `project_id`
- `research_run_id`
- `finding_text`
- `evidence_text`
- `source_name`
- `publication_date` (nullable)
- `non_clickable_source_identifier`
- `review_state` (`accept` / `reject` / `edit` / `unresolved`)
- `edited_text` (nullable)

### MasterRulesVersion
- `master_rules_version_id`
- `version_number`
- `rules_content`
- `created_at`
- `change_summary`
- `active_for_new_projects`

### ProviderConfiguration
- `provider_id`
- `display_name`
- `integration_type`
- `free_eligibility_checked_at`
- `eligibility_status`
- `allowed_model_ids`
- `priority`
- `connection_status`
- `secret_reference` (reference to protected store only; never raw secret in ordinary project data)

### AuditEvent
- `event_id`
- `project_id` (nullable for global settings)
- `event_type` (approval/migration/export/restore/delete/provider-change)
- `actor_id` (if accounts exist)
- `timestamp`
- `target_version_ids`
- `result_status`
- `safe_details` (must exclude secrets)

## Integrity constraints
- Every generated output must reference the analysis version and Master Rules version used.
- Approved output versions are immutable records; edits create successors.
- Active downstream analysis must be approved.
- Project deletion must not cascade to Permanent Master Rules or provider settings.
- Credentials never belong in project records, output content, audit details, or export payloads.
- The database implementation must enforce access control at the service layer, not rely only on hidden UI controls.

## Hinglish
Yeh suggested data model developer ko version links aur project separation samjhane ke liye hai. Actual database abhi select nahi hua, isliye schema ko chosen technology ke hisaab se implement kar sakte hain, par integrity rules same rahenge.
