/**
 * Deterministic Source-Grounded Script Generation Engine
 * Strictly adheres to:
 * - 04_FUNCTION_01_SCRIPT_GENERATION.md
 * - 10_PERMANENT_MASTER_RULES.md (Rules 15-20)
 * - ₹0 Budget (Zero external AI calls; transparent local execution)
 */

import { Project, AnalysisVersion, ScriptSegment, ScriptContent } from '../types';

export interface ScriptGenerationParams {
  project: Project;
  analysis: AnalysisVersion;
  rulesVersionId: string;
}

export interface ScriptGenerationResult {
  success: boolean;
  content?: ScriptContent;
  error?: string;
  warnings: string[];
}

/**
 * Story purpose sequence for video segments
 */
const SHORTS_PURPOSES = [
  'Hook / Core Mystery',
  'Context & Setup',
  'Key Development / Discovery',
  'Escalation / Evidence',
  'Consequence / Revelation',
  'Key Turning Point',
  'Supporting Detail',
  'Intriguing Twist',
  'Climax / Clashing Claims',
  'Resolution / Takeaway',
  'Call to Action / Question',
  'Final Conclusion',
];

/**
 * Generate a source-grounded script from approved analysis
 * Strictly enforces:
 * - Approved analysis precondition (AC-F01-01)
 * - Shorts segment count matching user selection (AC-F01-03)
 * - Long video duration >= 240s with ~8s segments and final segment adjustment (AC-F01-04)
 * - Segments containing narration, visual direction, and on-screen text (AC-F01-02)
 * - Master Language consistency (Hindi or English)
 * - Non-clickable claim references
 */
export function generateScriptFromAnalysis(params: ScriptGenerationParams): ScriptGenerationResult {
  const { project, analysis } = params;
  const warnings: string[] = [];

  // Precondition 1: Analysis must be approved (Rule 13 / AC-F01-01)
  if (analysis.review_status !== 'approved') {
    return {
      success: false,
      error: `Precondition Failed: Script cannot be generated from an unapproved analysis version (status: ${analysis.review_status}). User approval is required.`,
      warnings: ['AC-F01-01 violation blocked: Analysis is not approved.'],
    };
  }

  // Precondition 2: Project format validation
  let targetSegmentCount = 0;
  let targetTotalDurationSec = 0;

  if (project.format_type === 'shorts') {
    const count = project.shorts_segment_count || 5;
    if (count < 1) {
      return { success: false, error: 'Shorts segment count must be at least 1.', warnings: [] };
    }
    targetSegmentCount = count;
    targetTotalDurationSec = count * 8;
  } else if (project.format_type === 'long_video') {
    const durationSec = project.target_duration_seconds || 240;
    if (durationSec < 240) {
      return {
        success: false,
        error: 'Long video format strictly requires a minimum duration of 4 minutes (240 seconds) per Rule 18.',
        warnings: [],
      };
    }
    targetTotalDurationSec = durationSec;
    targetSegmentCount = Math.ceil(durationSec / 8);
  } else {
    return { success: false, error: 'Invalid format_type on project.', warnings: [] };
  }

  const isHindi = project.master_language === 'hi';
  const claims = analysis.claim_records || [];
  const sections = analysis.sections;

  const segments: ScriptSegment[] = [];

  for (let i = 0; i < targetSegmentCount; i++) {
    const segmentNum = i + 1;
    const isFinalSegment = segmentNum === targetSegmentCount;

    // Segment duration calculation:
    // Standard segments target 8 seconds.
    // In long video, the final segment duration adjusts to meet the total target duration (Rule 18 / DEC-010).
    let segmentDuration = 8;
    if (project.format_type === 'long_video' && isFinalSegment) {
      const accumulatedPrior = (targetSegmentCount - 1) * 8;
      const remainder = targetTotalDurationSec - accumulatedPrior;
      segmentDuration = remainder > 0 ? remainder : 8;
    }

    // Determine purpose
    let purpose = '';
    if (project.format_type === 'shorts') {
      purpose = SHORTS_PURPOSES[i % SHORTS_PURPOSES.length];
    } else {
      if (i === 0) purpose = 'Opening Hook & Topic Introduction';
      else if (i === 1) purpose = 'Historical Background & Origins';
      else if (i < targetSegmentCount - 2) purpose = `Deep Dive Investigation Part ${i - 1}`;
      else if (i === targetSegmentCount - 2) purpose = 'Core Conflict & Synthesis';
      else purpose = 'Conclusion & Strategic Takeaway';
    }

    // Associate claim references (if available in approved analysis)
    const associatedClaim = claims[i % (claims.length || 1)];
    const claimRefs = associatedClaim ? [associatedClaim.claim_id] : [];

    // Factual evidence text from approved analysis
    const claimEvidence = associatedClaim?.evidence_text || sections.key_facts_with_evidence || sections.main_story_core_claims;

    // Generate language-specific narration grounded strictly in the approved analysis
    let narration = '';
    let visualDirection = '';
    let onScreenText = '';

    if (isHindi) {
      if (i === 0) {
        narration = `क्या आप जानते हैं? ${sections.source_summary.slice(0, 100) || 'इस घटना के पीछे की असली सच्चाई जानकर आप हैरान रह जाएंगे।'}`;
        visualDirection = `हाई-इम्पैक्ट क्लोज-अप शॉट, ड्रामेटिक लाइटिंग, 9:16 फ्रेम में केंद्रित मुख्य विषय।`;
        onScreenText = `खुलासा: सच क्या है?`;
      } else if (isFinalSegment) {
        narration = `तथ्यों के अनुसार निष्कर्ष स्पष्ट है: ${sections.main_story_core_claims.slice(0, 90) || 'इस पर आपकी क्या राय है? कमेंट में बताएं।'}`;
        visualDirection = `सिनेमैटिक वाइड शॉट, धीमा कैमरा पुल-बैक, समापन संदेश।`;
        onScreenText = `आपका विचार क्या है?`;
      } else {
        const factSnippet = associatedClaim ? associatedClaim.claim_text : sections.numbers_dates_exact_details.slice(0, 80);
        narration = `दस्तावेजों में दर्ज साक्ष्य: ${factSnippet || 'स्रोत के मुख्य तथ्यों पर नजर डालें।'}`;
        visualDirection = `डिटेल्ड बी-रोल दृश्य, धीमी गति से कैमरा पैन, साक्ष्यों और संदर्भ का चित्रण।`;
        onScreenText = associatedClaim ? `साक्ष्य #${segmentNum}` : `महत्वपूर्ण तथ्य`;
      }
    } else {
      // English
      if (i === 0) {
        narration = `Here is what the records actually reveal: ${sections.source_summary.slice(0, 110) || 'The facts behind this story are more compelling than the rumors.'}`;
        visualDirection = `Dramatic high-contrast opening shot, shallow depth of field focusing on primary subject.`;
        onScreenText = `THE UNTOLD FACTS`;
      } else if (isFinalSegment) {
        narration = `Based on the verified source evidence: ${sections.main_story_core_claims.slice(0, 95) || 'What do you make of these findings? Share your perspective.'}`;
        visualDirection = `Cinematic wide angle, subtle camera retreat towards resolution framing.`;
        onScreenText = `WHAT IS YOUR TAKE?`;
      } else {
        const factSnippet = associatedClaim ? associatedClaim.claim_text : sections.numbers_dates_exact_details.slice(0, 90);
        narration = `According to documented evidence: ${factSnippet || 'The documented timeline sheds clear light on this development.'}`;
        visualDirection = `Engaging B-roll sequence illustrating timeline and subject relationships with dynamic framing.`;
        onScreenText = associatedClaim ? `Fact Record #${segmentNum}` : `KEY EVIDENCE`;
      }
    }

    // Continuity and transition notes
    const transitionNote = i === 0 
      ? 'Start sequence with immediate visual impact; no intro lag.' 
      : `Match visual tone and lighting continuity from segment ${segmentNum - 1}.`;

    segments.push({
      segment_id: `seg-${segmentNum}-${Math.random().toString(36).substring(2, 6)}`,
      segment_number: segmentNum,
      target_duration: segmentDuration,
      purpose,
      narration,
      visual_direction: visualDirection,
      on_screen_text: onScreenText,
      transition_note: transitionNote,
      claim_references: claimRefs,
      warnings: associatedClaim?.status === 'unverified' ? ['Note: Referenced claim is marked unverified in analysis.'] : [],
    });
  }

  return {
    success: true,
    content: { segments },
    warnings,
  };
}
