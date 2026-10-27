/**
 * Source Analysis Service
 * Strictly adheres to:
 * - 08_SOURCE_ANALYSIS_SPECIFICATION.md
 * - 10_PERMANENT_MASTER_RULES.md (Rules 9-14, 1-8)
 * - TASK-10 Source Analysis and Explicit Approval Correction
 * - Strict ₹0 Budget (Zero external AI calls; transparent honest labeling)
 */

import { 
  Project, 
  Source, 
  AnalysisVersion, 
  ClaimRecord, 
  SourceAnalysisReportSections 
} from '../types';

/**
 * Notice displayed to user for honest labeling under ₹0 budget constraint
 */
export const SOURCE_ANALYSIS_HONEST_LABELING_NOTICE =
  'Source Analysis Draft Notice: In strict compliance with the ₹0 budget and Plan-Lock constraints, external LLM fact-checking APIs are not called. This 10-section analysis draft extracts preserved source text into structured sections. All claims are initialized as UNVERIFIED until manually reviewed and verified by you. Please review and edit all 10 sections before explicit human approval.';

/**
 * Sanitizes text to remove any clickable links or URLs (Rule 11, Rule 30, Rule 47)
 */
export function sanitizeNonClickable(text: string): string {
  if (!text) return '';
  return text
    .replace(/https?:\/\/[^\s)]+/gi, '[source reference]')
    .replace(/www\.[^\s)]+/gi, '[source reference]')
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
    .trim();
}

export interface SourceAnalysisSectionMeta {
  key: keyof SourceAnalysisReportSections;
  label: string;
  labelHi: string;
  description: string;
}

export const REQUIRED_SOURCE_ANALYSIS_SECTIONS: SourceAnalysisSectionMeta[] = [
  { key: 'source_summary', label: '1. Source Summary', labelHi: '1. स्रोत सारांश', description: 'Concise factual summary derived strictly from supplied source material' },
  { key: 'main_story_core_claims', label: '2. Main Story Core Claims', labelHi: '2. मुख्य कहानी के दावे', description: 'Core narrative claims and central thesis' },
  { key: 'key_facts_with_evidence', label: '3. Key Facts with Evidence', labelHi: '3. प्रमाण सहित मुख्य तथ्य', description: 'Verifiable factual statements backed by source citations' },
  { key: 'timeline_chronology', label: '4. Timeline & Chronology', labelHi: '4. घटनाक्रम और समयरेखा', description: 'Chronological events and time markers documented in source' },
  { key: 'entities_relationships', label: '5. Entities & Relationships', labelHi: '5. व्यक्ति, संस्थाएं और संबंध', description: 'Named people, places, organizations and connections' },
  { key: 'numbers_dates_exact_details', label: '6. Numbers, Dates & Exact Details', labelHi: '6. संख्याएं, दिनांक और सटीक विवरण', description: 'Exact numeric metrics, measurements, and timestamps' },
  { key: 'uncertainty_conflicts', label: '7. Uncertainty & Conflicts', labelHi: '7. अनिश्चितताएं और विरोधाभास', description: 'Conflicting points, disputed claims, and ambiguities' },
  { key: 'missing_context', label: '8. Missing Context', labelHi: '8. अनुपलब्ध संदर्भ', description: 'Crucial background or questions not answered in source' },
  { key: 'story_angles', label: '9. Story Angles', labelHi: '9. कहानी के संभावित दृष्टिकोण', description: 'Compelling presentation angles supported by evidence' },
  { key: 'source_limitations', label: '10. Source Limitations', labelHi: '10. स्रोत की सीमाएं', description: 'Boundary conditions, bias notes, and non-coverage disclaimers' }
];

export interface CreateDraftAnalysisParams {
  project?: Project;
  projectId?: string;
  sources: Source[];
  existingVersionsCount?: number;
  versionNumber?: number;
  language?: string;
}

/**
 * Creates an honest 10-section Source Analysis Draft from preserved source material.
 * Enforces:
 * - review_status is strictly 'draft' (NEVER approved during creation)
 * - approved_at is null
 * - Claims are initialized as 'unverified' (NOT 'source-supported' unless evidence is verified)
 * - Every ClaimRecord.analysis_version_id strictly matches the parent analysis_version_id
 * - Preserves source IDs and project isolation
 * - All 10 required report sections are populated as drafts for user review and editing
 */
export function createDraftSourceAnalysis(params: CreateDraftAnalysisParams): AnalysisVersion {
  const { project, projectId, sources, existingVersionsCount = 0, versionNumber } = params;

  if (!sources || sources.length === 0) {
    throw new Error('Cannot create Source Analysis: At least one preserved source is required (Rule 1).');
  }

  const effectiveProjectId = projectId || project?.project_id || '';
  if (!effectiveProjectId) {
    throw new Error('Cannot create Source Analysis: Project ID is required.');
  }

  const analysisVersionId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const primarySource = sources[0];
  const combinedSourceContent = sources
    .map((s) => s.content_or_storage_reference)
    .filter(Boolean)
    .join('\n\n');

  const cleanContent = sanitizeNonClickable(combinedSourceContent);
  const cleanSummarySnippet = cleanContent.slice(0, 300).trim();
  const cleanSourceLabels = sources
    .map((s) => sanitizeNonClickable(s.source_label || (s as any).label || 'Source'))
    .join(', ');

  // 10 Fixed Sections with transparent, honest draft labeling
  const sections: SourceAnalysisReportSections = {
    source_summary: cleanSummarySnippet 
      ? `Source Summary (Draft from preserved input):\n${cleanSummarySnippet}`
      : '[Draft: Provide a factual summary grounded in the supplied source material]',
    main_story_core_claims: '[Draft: Review and outline the core claims and central premise documented in the source]',
    key_facts_with_evidence: '[Draft: List verifiable factual statements with specific paragraph/section references]',
    timeline_chronology: '[Draft: Record chronological sequence, established dates, and time periods from source records]',
    entities_relationships: '[Draft: Identify key people, organizations, locations, and documented relationships]',
    numbers_dates_exact_details: '[Draft: Record exact numbers, quantities, measurements, and dates without estimation]',
    uncertainty_conflicts: '[Draft: Note ambiguities, caveats, conflicting accounts, or unverified claims in source]',
    missing_context: '[Draft: Document missing background, unanswered questions, or omitted context]',
    story_angles: '[Draft: Identify potential storytelling angles aligned with verified evidence]',
    source_limitations: `Source material limited to supplied inputs (${cleanSourceLabels}). Source analysis does not perform external fact-checking (Rule 12).`,
  };

  // Initial Claim Records: Initialized as UNVERIFIED per Rule 10 & TASK-10 Requirement 6
  const claimRecords: ClaimRecord[] = [];
  if (primarySource && primarySource.content_or_storage_reference.trim()) {
    const claimSnippet = sanitizeNonClickable(primarySource.content_or_storage_reference.slice(0, 160).trim());
    const initialClaim: ClaimRecord = {
      claim_id: `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      analysis_version_id: analysisVersionId, // EXACT MATCH GUARANTEED
      claim_text: claimSnippet || 'Initial source excerpt awaiting verification',
      status: 'unverified', // Strictly UNVERIFIED by default (TASK-10)
      importance: 'high',
      claim_type: 'fact',
      evidence_text: claimSnippet,
      source_id: primarySource.source_id,
      source_location: 'Supplied source text excerpt',
      attribution: sanitizeNonClickable(primarySource.source_label || (primarySource as any).label || 'Primary Source'),
      caveat: 'Awaiting user review and evidence status confirmation',
      review_status: 'pending',
    };
    claimRecords.push(initialClaim);
  }

  const effectiveVersionNumber = versionNumber !== undefined ? versionNumber : existingVersionsCount + 1;

  return {
    analysis_version_id: analysisVersionId,
    project_id: effectiveProjectId,
    source_version_ids: sources.map((s) => s.source_id),
    version_number: effectiveVersionNumber,
    analysis_type: 'source_only',
    report_schema_version: '1.0',
    sections,
    claim_records: claimRecords,
    created_at: new Date().toISOString(),
    review_status: 'draft', // Strictly DRAFT
    approved_at: null, // Strictly NULL on draft creation
    supersedes_analysis_version_id: null,
  };
}

/**
 * Validates an analysis before explicit approval can be finalized
 */
export function validateAnalysisForApproval(analysis: AnalysisVersion): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 10 sections exist
  const requiredSectionKeys: (keyof SourceAnalysisReportSections)[] = [
    'source_summary',
    'main_story_core_claims',
    'key_facts_with_evidence',
    'timeline_chronology',
    'entities_relationships',
    'numbers_dates_exact_details',
    'uncertainty_conflicts',
    'missing_context',
    'story_angles',
    'source_limitations',
  ];

  for (const key of requiredSectionKeys) {
    const val = analysis.sections[key];
    if (!val || typeof val !== 'string' || !val.trim()) {
      errors.push(`Required Section "${key.replace(/_/g, ' ')}" cannot be empty.`);
    }
  }

  // Verify ClaimRecord ID linkage
  if (analysis.claim_records && analysis.claim_records.length > 0) {
    for (let i = 0; i < analysis.claim_records.length; i++) {
      const c = analysis.claim_records[i];
      if (c.analysis_version_id !== analysis.analysis_version_id) {
        errors.push(`ClaimRecord #${i + 1} (${c.claim_id}) analysis_version_id mismatch. Expected: ${analysis.analysis_version_id}, got: ${c.analysis_version_id}`);
      }
      if (c.status === 'source-supported' && (!c.evidence_text || !c.evidence_text.trim())) {
        errors.push(`ClaimRecord #${i + 1} marked "source-supported" must have valid evidence text.`);
      }
      if (c.status === 'source-supported' && (!c.source_id || !c.source_id.trim())) {
        errors.push(`ClaimRecord #${i + 1} marked "source-supported" must reference a valid source_id.`);
      }
    }
  }

  // Verify non-clickable links rule across all sections and claim text (Rules 11, 30, 47)
  const fullText = [
    ...Object.values(analysis.sections),
    ...(analysis.claim_records || []).map((c) => `${c.claim_text} ${c.evidence_text} ${c.caveat}`),
  ].join(' ');

  if (/https?:\/\/|www\./i.test(fullText)) {
    errors.push('Clickable link detected in analysis content. Rule 11/30/47 strictly forbids clickable URLs; convert to non-clickable plain text references.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
