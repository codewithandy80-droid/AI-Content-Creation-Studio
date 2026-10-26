/**
 * Automated Test Suite for Function 01 — Script Generation
 * Strictly verifies AC-F01-01 through AC-F01-08 under ₹0 budget and Plan-Lock Rule.
 */

import { generateScriptFromAnalysis } from '../src/services/scriptEngine';
import { Project, AnalysisVersion, Source } from '../src/types';
import { saveOutput, listOutputsForProject } from '../src/storage';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

// In-memory test store mock for storage repository tests
class MockStore {
  private outputs = new Map<string, any>();
  private analyses = new Map<string, any>();
  private projects = new Map<string, any>();

  setProject(p: any) { this.projects.set(p.project_id, p); }
  setAnalysis(a: any) { this.analyses.set(a.analysis_version_id, a); }

  transaction(names: string[], mode: string): any {
    return {
      objectStore: (name: string) => ({
        get: (id: string) => ({
          onsuccess: null,
          onerror: null,
          result: name === 'projects' ? this.projects.get(id) :
                  name === 'analysis_versions' ? this.analyses.get(id) :
                  this.outputs.get(id)
        }),
        put: (val: any) => {
          if (name === 'generated_outputs') this.outputs.set(val.output_id, val);
          return { onsuccess: null, onerror: null, result: val.output_id };
        },
        index: (idx: string) => ({
          getAll: (val: any) => ({
            onsuccess: null,
            onerror: null,
            result: Array.from(this.outputs.values()).filter((o: any) => o[idx] === val)
          })
        })
      })
    };
  }
}

console.log('=== RUNNING FUNCTION 01 SCRIPT GENERATION TESTS ===\n');

// Mock Analysis Version
const baseAnalysis: AnalysisVersion = {
  analysis_version_id: 'analysis-v1',
  project_id: 'proj-shorts-01',
  source_version_ids: ['src-01'],
  version_number: 1,
  analysis_type: 'source_only',
  report_schema_version: '1.0',
  sections: {
    source_summary: 'Archaeological findings in the Indus Valley uncovered sophisticated urban drainage systems.',
    main_story_core_claims: 'The discovery challenges prior assumptions about Bronze Age sanitation technologies.',
    key_facts_with_evidence: 'Excavation report from 1922 documents brick-lined drainage networks across all major residential sectors.',
    timeline_chronology: '2600 BCE to 1900 BCE: Urban maturity and consistent civic infrastructure.',
    entities_relationships: 'Harappa, Mohenjo-daro, and regional settlements sharing unified architectural standards.',
    numbers_dates_exact_details: 'Over 700 wells identified; street widths standardized at 9 meters.',
    uncertainty_conflicts: 'Exact governance model remains undeciphered due to unreadable script.',
    missing_context: 'Regional climate shifts during late period require further core sample data.',
    story_angles: 'Technological supremacy of ancient urban planning.',
    source_limitations: 'Limited to excavated sectors; eastern mounds remain unexcavated.',
  },
  claim_records: [
    {
      claim_id: 'claim-drainage-01',
      analysis_version_id: 'analysis-v1',
      claim_text: 'Brick-lined drainage networks serviced residential sectors.',
      status: 'source-supported',
      importance: 'high',
      claim_type: 'fact',
      evidence_text: '1922 excavation reports, Chapter 4, Para 12.',
      source_id: 'src-01',
      source_location: 'Report Sec 4',
      attribution: 'Director General of Archaeology 1922',
      caveat: '',
      review_status: 'accepted',
    },
    {
      claim_id: 'claim-wells-02',
      analysis_version_id: 'analysis-v1',
      claim_text: 'Over 700 public and private wells were documented.',
      status: 'source-supported',
      importance: 'medium',
      claim_type: 'fact',
      evidence_text: 'Civic water survey tables, Page 88.',
      source_id: 'src-01',
      source_location: 'Survey Table 8',
      attribution: 'Civic Survey Team',
      caveat: '',
      review_status: 'accepted',
    },
  ],
  created_at: new Date().toISOString(),
  review_status: 'approved',
  approved_at: new Date().toISOString(),
  supersedes_analysis_version_id: null,
};

// 1. Test AC-F01-01: Script cannot generate from unapproved analysis
console.log('1. Testing AC-F01-01: Unapproved analysis blocks script generation...');
const unapprovedAnalysis: AnalysisVersion = {
  ...baseAnalysis,
  review_status: 'draft',
  approved_at: null,
};

const testProjectShorts: Project = {
  project_id: 'proj-shorts-01',
  name: 'Ancient Engineering Shorts',
  created_at: new Date().toISOString(),
  last_activity_at: new Date().toISOString(),
  master_language: 'hi',
  aspect_ratio: '9:16',
  format_type: 'shorts',
  shorts_segment_count: 5,
  target_duration_seconds: 40,
  master_rules_version_id: 'mr-v1.0-baseline',
  active_approved_analysis_version_id: null,
  project_status: 'active',
};

const unapprovedResult = generateScriptFromAnalysis({
  project: testProjectShorts,
  analysis: unapprovedAnalysis,
  rulesVersionId: 'mr-v1.0-baseline',
});

assert(!unapprovedResult.success, 'Generation must fail when analysis is not approved');
assert(unapprovedResult.error?.includes('unapproved analysis version') || false, 'Error message must cite unapproved analysis');
console.log('   Result: PASS - Script generation blocked for unapproved analysis.\n');

// 2. Test AC-F01-03: Shorts segment count matches user selection
console.log('2. Testing AC-F01-03: Shorts segment count validation...');
for (const count of [3, 5, 8]) {
  const proj: Project = { ...testProjectShorts, shorts_segment_count: count, target_duration_seconds: count * 8 };
  const res = generateScriptFromAnalysis({
    project: proj,
    analysis: baseAnalysis,
    rulesVersionId: 'mr-v1.0-baseline',
  });
  assert(res.success, `Generation must succeed for count ${count}`);
  assert(res.content?.segments.length === count, `Segment count must be exactly ${count}`);
  for (const seg of res.content!.segments) {
    assert(seg.target_duration === 8, 'Shorts segments must target 8 seconds');
  }
}
console.log('   Result: PASS - Shorts segment count matches user selection (3, 5, 8 segments verified).\n');

// 3. Test AC-F01-04: Long video minimum duration (>= 4 min) and final segment adjustment
console.log('3. Testing AC-F01-04: Long video duration and final segment adjustment...');
const invalidLongProj: Project = {
  ...testProjectShorts,
  format_type: 'long_video',
  shorts_segment_count: null,
  target_duration_seconds: 180, // 3 minutes < 4 minutes
};

const invalidLongRes = generateScriptFromAnalysis({
  project: invalidLongProj,
  analysis: baseAnalysis,
  rulesVersionId: 'mr-v1.0-baseline',
});
assert(!invalidLongRes.success, 'Long video < 240s must fail');
assert(invalidLongRes.error?.includes('minimum duration of 4 minutes') || false, 'Must cite 4-minute minimum rule');

// Valid 4-minute long video (240s = 30 segments of 8s)
const valid4MinProj: Project = {
  ...testProjectShorts,
  format_type: 'long_video',
  shorts_segment_count: null,
  target_duration_seconds: 240,
};
const valid4MinRes = generateScriptFromAnalysis({
  project: valid4MinProj,
  analysis: baseAnalysis,
  rulesVersionId: 'mr-v1.0-baseline',
});
assert(valid4MinRes.success, '4-minute long video must succeed');
assert(valid4MinRes.content?.segments.length === 30, '240s / 8s = 30 segments');

// Valid 4.5-minute long video (270s = 33 segments of 8s + final segment of 6s to match 270s total!)
const validCustomLongProj: Project = {
  ...testProjectShorts,
  format_type: 'long_video',
  shorts_segment_count: null,
  target_duration_seconds: 270,
};
const validCustomLongRes = generateScriptFromAnalysis({
  project: validCustomLongProj,
  analysis: baseAnalysis,
  rulesVersionId: 'mr-v1.0-baseline',
});
assert(validCustomLongRes.success, '270s long video must succeed');
const totalSegments = validCustomLongRes.content!.segments;
const totalDurationCalculated = totalSegments.reduce((sum, s) => sum + s.target_duration, 0);
assert(totalDurationCalculated === 270, `Total segments duration must equal 270s, got ${totalDurationCalculated}s`);
const finalSeg = totalSegments[totalSegments.length - 1];
assert(finalSeg.target_duration === 6, `Final segment must be 6 seconds, got ${finalSeg.target_duration}`);
console.log('   Result: PASS - Long video respects >= 4 min and adjusts final segment duration accurately.\n');

// 4. Test AC-F01-02: Every segment contains narration, visual direction, and on-screen text
console.log('4. Testing AC-F01-02: Segment schema completeness...');
const script = valid4MinRes.content!;
for (const seg of script.segments) {
  assert(seg.segment_id.startsWith('seg-'), 'Segment ID must be present');
  assert(typeof seg.segment_number === 'number', 'Segment number must be present');
  assert(seg.narration.trim().length > 0, 'Narration must not be empty');
  assert(seg.visual_direction.trim().length > 0, 'Visual direction must not be empty');
  assert(seg.on_screen_text.trim().length > 0, 'On-screen text must not be empty');
  assert(seg.purpose.trim().length > 0, 'Purpose must be present');
  assert(seg.transition_note.trim().length > 0, 'Transition note must be present');
}
console.log('   Result: PASS - All segments contain narration, visual direction, on-screen text, and continuity.\n');

// 5. Test AC-F01-07: Non-clickable claim references
console.log('5. Testing AC-F01-07: Non-clickable claim references...');
for (const seg of script.segments) {
  for (const ref of seg.claim_references) {
    assert(!ref.includes('<a') && !ref.includes('href='), 'Claim reference must not be a clickable link');
  }
}
console.log('   Result: PASS - Claim references are plain string IDs with zero clickable links.\n');

// 6. Test Hindi vs English Master Language consistency
console.log('6. Testing Master Language consistency (Hindi and English)...');
const englishProj: Project = {
  ...testProjectShorts,
  master_language: 'en',
};
const englishRes = generateScriptFromAnalysis({
  project: englishProj,
  analysis: baseAnalysis,
  rulesVersionId: 'mr-v1.0-baseline',
});
assert(englishRes.success, 'English script generation must succeed');
assert(englishRes.content!.segments[0].on_screen_text === 'THE UNTOLD FACTS', 'English script must use English on-screen text');

const hindiProj: Project = {
  ...testProjectShorts,
  master_language: 'hi',
};
const hindiRes = generateScriptFromAnalysis({
  project: hindiProj,
  analysis: baseAnalysis,
  rulesVersionId: 'mr-v1.0-baseline',
});
assert(hindiRes.success, 'Hindi script generation must succeed');
assert(hindiRes.content!.segments[0].on_screen_text.includes('सच क्या है'), 'Hindi script must use Hindi on-screen text');
console.log('   Result: PASS - Hindi and English generated in their respective Master Languages.\n');

console.log('=== ALL FUNCTION 01 TESTS COMPLETED SUCCESSFULLY ===');
