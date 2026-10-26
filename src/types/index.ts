/**
 * Core Data Structures and Domain Types
 * Derived strictly from 17_GLOSSARY_AND_DATA_STRUCTURES.md, 08_SOURCE_ANALYSIS_SPECIFICATION.md,
 * and approved Phase 0 decisions.
 */

export type MasterLanguage = 'hi' | 'en';
export type AspectRatio = '9:16' | '16:9';
export type FormatType = 'shorts' | 'long_video';

export type OutputReviewStatus = 'draft' | 'in_review' | 'approved' | 'superseded';
export type ClaimEvidenceStatus = 'source-supported' | 'unverified' | 'conflicting';
export type ClaimImportance = 'high' | 'medium' | 'low';
export type ClaimType = 'fact' | 'allegation' | 'opinion' | 'prediction' | 'interpretation';
export type ClaimReviewStatus = 'pending' | 'accepted' | 'rejected';

export type SourceType = 'pasted_text' | 'upload' | 'url';
export type IngestionStatus =
  | 'queued'
  | 'processing'
  | 'imported'
  | 'partially_imported'
  | 'failed'
  | 'unsupported';

export type OutputType = 'script' | 'flow_prompt' | 'thumbnail_prompt' | 'seo';
export type ResearchReviewState = 'accept' | 'reject' | 'edit' | 'unresolved';

/**
 * 1. Project Entity
 */
export interface Project {
  project_id: string;
  name: string;
  created_at: string;
  last_activity_at: string;
  master_language: MasterLanguage;
  aspect_ratio: AspectRatio;
  format_type: FormatType;
  shorts_segment_count: number | null;
  target_duration_seconds: number | null;
  master_rules_version_id: string;
  active_approved_analysis_version_id: string | null;
  project_status: 'active' | 'archived' | 'deleted';
}

/**
 * 2. Source Record
 */
export interface Source {
  source_id: string;
  project_id: string;
  source_type: SourceType;
  source_label: string;
  source_version: number;
  content_or_storage_reference: string;
  source_hash: string | null;
  ingestion_status: IngestionStatus;
  captured_at: string;
  non_clickable_provenance_text: string;
  location_index_metadata: Record<string, unknown> | null;
}

/**
 * 3. Fixed 10-Section Source Analysis Report
 */
export interface SourceAnalysisReportSections {
  source_summary: string;
  main_story_core_claims: string;
  key_facts_with_evidence: string;
  timeline_chronology: string;
  entities_relationships: string;
  numbers_dates_exact_details: string;
  uncertainty_conflicts: string;
  missing_context: string;
  story_angles: string;
  source_limitations: string;
}

/**
 * 4. Claim Record
 */
export interface ClaimRecord {
  claim_id: string;
  analysis_version_id: string;
  claim_text: string;
  status: ClaimEvidenceStatus;
  importance: ClaimImportance;
  claim_type: ClaimType;
  evidence_text: string;
  source_id: string;
  source_location: string;
  attribution: string;
  caveat: string;
  review_status: ClaimReviewStatus;
}

/**
 * 5. Analysis Version Entity
 */
export interface AnalysisVersion {
  analysis_version_id: string;
  project_id: string;
  source_version_ids: string[];
  version_number: number;
  analysis_type: 'source_only' | 'research_informed';
  report_schema_version: string;
  sections: SourceAnalysisReportSections;
  claim_records: ClaimRecord[];
  created_at: string;
  review_status: OutputReviewStatus;
  approved_at: string | null;
  supersedes_analysis_version_id: string | null;
}

/**
 * 6. Function 01 — Script Segment & Content
 */
export interface ScriptSegment {
  segment_id: string;
  segment_number: number;
  target_duration: number;
  purpose: string;
  narration: string;
  visual_direction: string;
  on_screen_text: string;
  transition_note: string;
  claim_references: string[];
  warnings: string[];
}

export interface ScriptContent {
  segments: ScriptSegment[];
}

/**
 * 7. Function 02 — Google Flow Video Prompt Item & Content
 */
export interface FlowPromptItem {
  segment_id: string;
  segment_number?: number;
  prompt_text: string;
  aspect_ratio: AspectRatio;
  target_duration: number;
  scene_action: string;
  camera: string;
  lighting: string;
  timing: string;
  continuity: string;
  sound_music: string;
  narrator_style: string;
  claim_references?: string[];
  warnings?: string[];
}

export interface FlowPromptContent {
  prompts: FlowPromptItem[];
  disclaimer?: string;
  script_version_id?: string;
}

/**
 * 8. Function 03 — Thumbnail Prompt Options A and B
 */
export interface ThumbnailConcept {
  concept_label: string;
  prompt_text: string;
  main_subject: string;
  composition: string;
  lighting_color: string;
  text_headline_placement: string;
  aspect_ratio: AspectRatio;
  camera_perspective?: string;
  safe_space_guidance?: string;
  negative_constraints?: string;
  suggested_headline?: string;
  visual_style?: string;
  warnings?: string[];
}

export interface ThumbnailPromptContent {
  option_a: ThumbnailConcept; // High-impact / suspenseful / dramatic
  option_b: ThumbnailConcept; // Mystery / discovery / cinematic storytelling
  disclaimer?: string;
  script_version_id?: string;
  analysis_version_id?: string;
  title_context?: string;
}

/**
 * 9. Function 04 — YouTube SEO Content (DEC-ARCH-04 Approved Defaults)
 */
export interface SEODescriptionTemplate {
  hook: string;
  summary: string;
  key_highlights: string[];
  chapter_timestamps: string; // non-clickable plain text
}

export interface SEOContent {
  title_options: string[]; // exactly 5 options approved
  recommended_title: string;
  description: SEODescriptionTemplate;
  tags: string[]; // 15–20 tags approved
  primary_keywords: string[]; // 5 primary keywords approved
  secondary_keywords: string[]; // 10 secondary keywords approved
  hashtags: string[]; // 3–5 hashtags approved
  title_thumbnail_alignment_check: string;
  ai_disclosure_guidance?: string;
  retention_packaging_tips?: string[];
  script_version_id?: string;
  analysis_version_id?: string;
  thumbnail_output_id?: string;
  warnings?: string[];
}

/**
 * 10. Generated Output Container
 */
export type OutputContentUnion =
  | { type: 'script'; data: ScriptContent }
  | { type: 'flow_prompt'; data: FlowPromptContent }
  | { type: 'thumbnail_prompt'; data: ThumbnailPromptContent }
  | { type: 'seo'; data: SEOContent };

export interface GeneratedOutput {
  output_id: string;
  project_id: string;
  output_type: OutputType;
  version_number: number;
  status: OutputReviewStatus;
  content: OutputContentUnion;
  analysis_version_id: string;
  master_rules_version_id: string;
  input_output_version_ids: string[];
  provider_id: string | null;
  model_id: string | null;
  created_at: string;
  approved_at: string | null;
  supersedes_output_id: string | null;
}

/**
 * 11. Optional Research Finding
 */
export interface ResearchFinding {
  finding_id: string;
  project_id: string;
  research_run_id: string;
  finding_text: string;
  evidence_text: string;
  source_name: string;
  publication_date: string | null;
  non_clickable_source_identifier: string;
  review_state: ResearchReviewState;
  edited_text: string | null;
}

/**
 * 12. Permanent Master Rules Version
 */
export interface MasterRulesVersion {
  master_rules_version_id: string;
  version_number: number;
  rules_content: string;
  created_at: string;
  change_summary: string;
  active_for_new_projects: boolean;
}

/**
 * 13. Provider Configuration (Candidate settings only, secrets excluded)
 */
export interface ProviderConfiguration {
  provider_id: string;
  display_name: string;
  integration_type: string;
  free_eligibility_checked_at: string;
  eligibility_status: 'eligible_free' | 'unverified' | 'ineligible_paid';
  allowed_model_ids: string[];
  priority: number;
  connection_status: 'unconfigured' | 'testing' | 'connected' | 'error' | 'paused';
  secret_reference: string | null;
}

/**
 * 14. Audit Event
 */
export interface AuditEvent {
  event_id: string;
  project_id: string | null;
  event_type: 'approval' | 'migration' | 'export' | 'restore' | 'delete' | 'provider-change';
  actor_id: string | null;
  timestamp: string;
  target_version_ids: string[];
  result_status: string;
  safe_details: Record<string, unknown>;
}

/**
 * 15. Complete Export Package Schema
 */
export interface ProjectExportPackage {
  package_version: '1.0';
  exported_at: string;
  project: Project;
  sources: Source[];
  analyses: AnalysisVersion[];
  outputs: GeneratedOutput[];
  research_findings: ResearchFinding[];
  master_rules_version: MasterRulesVersion;
  audit_trail: AuditEvent[];
}
