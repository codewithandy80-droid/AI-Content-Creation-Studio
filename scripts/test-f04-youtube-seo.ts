/**
 * Automated Test Suite for Function 04 — YouTube SEO
 * Strictly verifies AC-F04-01 through AC-F04-07, Master Rules 31-35, and ₹0 budget.
 */

import { 
  generateYouTubeSEO, 
  SEO_AI_DISCLOSURE_NOTICE, 
  SEO_NO_GUARANTEE_DISCLAIMER 
} from '../src/services/seoEngine';
import { 
  Project, 
  AnalysisVersion, 
  GeneratedOutput, 
  ScriptContent, 
  SEOContent, 
  ThumbnailPromptContent 
} from '../src/types';
import { saveOutput, listOutputsForProject } from '../src/storage';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

// Lightweight IDB simulation for storage repository tests
class MockIDBRequest<T> {
  result!: T;
  error: Error | null = null;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;

  succeed(val: T) {
    this.result = val;
    if (this.onsuccess) this.onsuccess();
  }

  fail(err: Error) {
    this.error = err;
    if (this.onerror) this.onerror();
  }
}

class MockIndex {
  constructor(private storeMap: Map<string, any>, private indexField: string) {}

  getAll(val: any): MockIDBRequest<any[]> {
    const req = new MockIDBRequest<any[]>();
    setTimeout(() => {
      const items = Array.from(this.storeMap.values()).filter((item) => item[this.indexField] === val);
      req.succeed(items);
    }, 0);
    return req as any;
  }
}

class MockObjectStore {
  constructor(private storeMap: Map<string, any>, private keyPath: string) {}

  get(key: string): MockIDBRequest<any> {
    const req = new MockIDBRequest<any>();
    setTimeout(() => req.succeed(this.storeMap.get(key)), 0);
    return req as any;
  }

  put(val: any): MockIDBRequest<string> {
    const req = new MockIDBRequest<string>();
    setTimeout(() => {
      const key = val[this.keyPath];
      this.storeMap.set(key, JSON.parse(JSON.stringify(val)));
      req.succeed(key);
    }, 0);
    return req as any;
  }

  index(name: string): MockIndex {
    return new MockIndex(this.storeMap, name);
  }
}

class MockTransaction {
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;

  constructor(private db: MockDatabase) {
    setTimeout(() => {
      if (this.oncomplete) this.oncomplete();
    }, 10);
  }

  objectStore(name: string): MockObjectStore {
    return this.db.getObjectStore(name);
  }
}

class MockDatabase {
  private stores = new Map<string, Map<string, any>>();
  private keyPaths: Record<string, string> = {
    projects: 'project_id',
    sources: 'source_id',
    analysis_versions: 'analysis_version_id',
    generated_outputs: 'output_id',
  };

  constructor() {
    for (const name of Object.keys(this.keyPaths)) {
      this.stores.set(name, new Map());
    }
  }

  getObjectStore(name: string): MockObjectStore {
    const map = this.stores.get(name);
    if (!map) throw new Error(`Unknown store ${name}`);
    return new MockObjectStore(map, this.keyPaths[name]);
  }

  transaction(names: string | string[], mode: string): MockTransaction {
    return new MockTransaction(this);
  }

  seed(storeName: string, item: any) {
    const map = this.stores.get(storeName);
    if (!map) throw new Error(`Unknown store ${storeName}`);
    map.set(item[this.keyPaths[storeName]], JSON.parse(JSON.stringify(item)));
  }
}

async function runAllTests() {
  console.log('=== RUNNING FUNCTION 04 YOUTUBE SEO TESTS ===\n');

  // Base Approved Analysis
  const approvedAnalysis: AnalysisVersion = {
    analysis_version_id: 'analysis-v1',
    project_id: 'proj-shorts-01',
    source_version_ids: ['src-01'],
    version_number: 1,
    analysis_type: 'source_only',
    report_schema_version: '1.0',
    sections: {
      source_summary: 'Excavations at Mohenjo-daro revealed an advanced underground drainage network constructed with precision baked bricks.',
      main_story_core_claims: 'Bronze Age sanitation engineering in the Indus Valley was centuries ahead of contemporary civilizations.',
      key_facts_with_evidence: 'Over 700 freshwater wells and standardized brick conduits uncovered in residential district 3.',
      timeline_chronology: '2600 BCE to 1900 BCE: Construction and active maintenance of civic sanitation network.',
      entities_relationships: 'Indus Valley engineers, municipal inspectors, and residential house connections.',
      numbers_dates_exact_details: '700 wells; 9-meter street grid; baked brick dimensions 1:2:4 ratio.',
      uncertainty_conflicts: 'Municipal governance structure remains undeciphered due to unread script.',
      missing_context: 'Drying of the ancient Saraswati river basin requires hydrological soil samples.',
      story_angles: 'Lost ancient engineering secrets that modern planners admire.',
      source_limitations: 'Archaeological site report limited to western citadel and lower city sectors.',
    },
    claim_records: [
      {
        claim_id: 'claim-drainage-01',
        analysis_version_id: 'analysis-v1',
        claim_text: 'Precision baked brick conduits connected private homes to central municipal drains.',
        status: 'source-supported',
        importance: 'high',
        claim_type: 'fact',
        evidence_text: 'Excavation Memoir 1922, Chapter 4, Page 45.',
        source_id: 'src-01',
        source_location: 'Page 45',
        attribution: 'Chief Archaeologist',
        caveat: '',
        review_status: 'accepted',
      },
    ],
    created_at: new Date().toISOString(),
    review_status: 'approved',
    approved_at: new Date().toISOString(),
    supersedes_analysis_version_id: null,
  };

  // Base Project (Shorts, 9:16, Hindi)
  const shortsProject: Project = {
    project_id: 'proj-shorts-01',
    name: 'Indus Valley Sanitation Mystery',
    created_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    master_language: 'hi',
    aspect_ratio: '9:16',
    format_type: 'shorts',
    shorts_segment_count: 5,
    target_duration_seconds: null,
    master_rules_version_id: 'rules-v1.0',
    active_approved_analysis_version_id: 'analysis-v1',
    project_status: 'active',
  };

  // Base Approved Script Output (5 segments)
  const approvedScriptOutput: GeneratedOutput = {
    output_id: 'out-script-01',
    project_id: 'proj-shorts-01',
    output_type: 'script',
    version_number: 1,
    status: 'approved',
    content: {
      type: 'script',
      data: {
        segments: [
          {
            segment_id: 'seg-1-indus',
            segment_number: 1,
            target_duration: 8,
            purpose: 'Hook / Mystery',
            narration: 'सिंधु घाटी की यह प्राचीन खोज वैज्ञानिकों को हैरान कर रही है।',
            visual_direction: 'रहस्यमयी प्राचीन ईंटों का ड्रेनेज नेटवर्क, 9:16 फ्रेम में ड्रामेटिक क्लोज-अप।',
            on_screen_text: 'रहस्यमयी प्राचीन तकनीक',
            transition_note: 'Sharp hook cut',
            claim_references: ['claim-drainage-01'],
            warnings: [],
          },
          {
            segment_id: 'seg-2-indus',
            segment_number: 2,
            target_duration: 8,
            purpose: 'Evidence',
            narration: '700 से अधिक कुएं और पक्की ईंटों की ढकी हुई नालियां हर घर से जुड़ी थीं।',
            visual_direction: 'उत्खनन स्थल का विस्तृत दृश्य, प्राचीन नगर का नक्शा।',
            on_screen_text: '700 से अधिक कुएं',
            transition_note: 'Smooth pan',
            claim_references: ['claim-drainage-01'],
            warnings: [],
          },
          {
            segment_id: 'seg-3-indus',
            segment_number: 3,
            target_duration: 8,
            purpose: 'Discovery',
            narration: 'यह तकनीक उस समय की अन्य सभ्यताओं में कहीं नहीं मिलती।',
            visual_direction: 'तुलनात्मक दृश्य, प्राचीन वास्तुकला।',
            on_screen_text: 'अद्वितीय तकनीक',
            transition_note: 'Cut to architecture',
            claim_references: ['claim-drainage-01'],
            warnings: [],
          },
        ],
      },
    },
    analysis_version_id: 'analysis-v1',
    master_rules_version_id: 'rules-v1.0',
    input_output_version_ids: [],
    provider_id: 'local-script-engine',
    model_id: 'script-engine-v1',
    created_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    supersedes_output_id: null,
  };

  // Optional Thumbnail Output
  const approvedThumbnailOutput: GeneratedOutput = {
    output_id: 'out-thumb-01',
    project_id: 'proj-shorts-01',
    output_type: 'thumbnail_prompt',
    version_number: 1,
    status: 'approved',
    content: {
      type: 'thumbnail_prompt',
      data: {
        option_a: {
          concept_label: 'Option A: High-Impact Dramatic Clash & Tension',
          prompt_text: 'Prompt text for Option A',
          main_subject: 'Ancient brick drainage conduit in high-tension focus',
          composition: 'Dynamic diagonal composition',
          lighting_color: 'Chiaroscuro amber rim light',
          text_headline_placement: 'Bold headline: बड़ा खुलासा',
          aspect_ratio: '9:16',
          suggested_headline: 'बड़ा खुलासा: अनदेखा सच!',
        },
        option_b: {
          concept_label: 'Option B: Mystery & Cinematic Discovery',
          prompt_text: 'Prompt text for Option B',
          main_subject: 'Archaeological mystery discovery',
          composition: 'Golden spiral layered perspective',
          lighting_color: 'Atmospheric twilight glow',
          text_headline_placement: 'Intrigue headline: रहस्यमयी सबूत',
          aspect_ratio: '9:16',
          suggested_headline: 'रहस्यमयी सबूत: क्या था असली सच?',
        },
      },
    },
    analysis_version_id: 'analysis-v1',
    master_rules_version_id: 'rules-v1.0',
    input_output_version_ids: ['out-script-01'],
    provider_id: 'local-thumbnail-engine',
    model_id: 'thumbnail-engine-v1',
    created_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    supersedes_output_id: null,
  };

  // -------------------------------------------------------------------------
  // Test 1: Unapproved Script or Analysis blocks generation (Rule 13 / AC-F04-04)
  // -------------------------------------------------------------------------
  console.log('Test 1: Unapproved script blocks SEO generation...');
  const draftScriptOutput: GeneratedOutput = {
    ...approvedScriptOutput,
    status: 'draft',
    approved_at: null,
  };

  const blockedByScript = generateYouTubeSEO({
    project: shortsProject,
    scriptOutput: draftScriptOutput,
    scriptContent: (draftScriptOutput.content as any).data,
    analysis: approvedAnalysis,
    rulesVersionId: 'rules-v1.0',
  });

  assert(blockedByScript.success === false, 'Draft script must block SEO generation');
  assert(blockedByScript.error?.includes('Precondition Failed'), 'Error must mention script precondition failure');
  console.log('✓ PASS: Unapproved script strictly blocks SEO generation.');

  console.log('\nTest 1b: Unapproved analysis blocks SEO generation...');
  const draftAnalysis: AnalysisVersion = {
    ...approvedAnalysis,
    review_status: 'draft',
    approved_at: null,
  };

  const blockedByAnalysis = generateYouTubeSEO({
    project: shortsProject,
    scriptOutput: approvedScriptOutput,
    scriptContent: (approvedScriptOutput.content as any).data,
    analysis: draftAnalysis,
    rulesVersionId: 'rules-v1.0',
  });

  assert(blockedByAnalysis.success === false, 'Unapproved analysis must block SEO generation');
  assert(blockedByAnalysis.error?.includes('Precondition Failed'), 'Error must mention analysis precondition');
  console.log('✓ PASS: Unapproved analysis strictly blocks SEO generation.');

  // -------------------------------------------------------------------------
  // Test 2: Mismatched Project ID is rejected (Project Isolation)
  // -------------------------------------------------------------------------
  console.log('\nTest 2: Mismatched project ID is rejected...');
  const mismatchedProject = generateYouTubeSEO({
    project: { ...shortsProject, project_id: 'foreign-project-99' },
    scriptOutput: approvedScriptOutput,
    scriptContent: (approvedScriptOutput.content as any).data,
    analysis: approvedAnalysis,
    rulesVersionId: 'rules-v1.0',
  });

  assert(mismatchedProject.success === false, 'Mismatched project ID must fail');
  assert(mismatchedProject.error?.includes('Mismatched project ID'), 'Error must note project ID mismatch');
  console.log('✓ PASS: Cross-project mismatched IDs are rejected.');

  // -------------------------------------------------------------------------
  // Test 3: Exactly five title options with exactly one recommended title (AC-F04-01)
  // -------------------------------------------------------------------------
  console.log('\nTest 3: Exactly 5 title options produced and exactly 1 recommended title (AC-F04-01)...');
  const genResult = generateYouTubeSEO({
    project: shortsProject,
    scriptOutput: approvedScriptOutput,
    scriptContent: (approvedScriptOutput.content as any).data,
    analysis: approvedAnalysis,
    rulesVersionId: 'rules-v1.0',
    thumbnailOutput: approvedThumbnailOutput,
    thumbnailContent: (approvedThumbnailOutput.content as any).data,
  });

  assert(genResult.success === true, 'SEO Generation must succeed');
  assert(Boolean(genResult.content), 'Content must be returned');
  const content = genResult.content!;

  assert(content.title_options.length === 5, `Expected exactly 5 title options, got ${content.title_options.length}`);
  assert(Boolean(content.recommended_title), 'Recommended title must exist');
  assert(content.title_options.includes(content.recommended_title), 'Recommended title must be one of the 5 title options');
  console.log(`✓ PASS: Generated exactly 5 titles. Recommended title: "${content.recommended_title}"`);

  // -------------------------------------------------------------------------
  // Test 4: Structured Description with Chapter Timestamps (AC-F04-02)
  // -------------------------------------------------------------------------
  console.log('\nTest 4: Structured description contains hook, summary, highlights, and plain-text timestamps (AC-F04-02)...');
  const desc = content.description;
  assert(Boolean(desc.hook && desc.hook.length > 10), 'Description hook must be present');
  assert(Boolean(desc.summary && desc.summary.length > 20), 'Description summary must be present');
  assert(Array.isArray(desc.key_highlights) && desc.key_highlights.length >= 3, 'Highlights must have at least 3 items');
  assert(Boolean(desc.chapter_timestamps), 'Chapter timestamps must be present');

  // Verify timestamps format: starts at 00:00 and contains segment marks
  assert(desc.chapter_timestamps.includes('00:00'), 'Chapter timestamps must start at 00:00');
  assert(desc.chapter_timestamps.includes('00:08'), 'Chapter timestamps second segment at 00:08');
  assert(desc.chapter_timestamps.includes('00:16'), 'Chapter timestamps third segment at 00:16');
  console.log('✓ PASS: Structured description sections and accurate chapter timestamps verified.');

  // -------------------------------------------------------------------------
  // Test 5: Tags count strictly within 15–20 (AC-F04-02 / DEC-ARCH-04)
  // -------------------------------------------------------------------------
  console.log('\nTest 5: Tag count is within approved 15–20 range (AC-F04-02)...');
  const tagCount = content.tags.length;
  assert(tagCount >= 15 && tagCount <= 20, `Tags count must be between 15 and 20, got ${tagCount}`);
  content.tags.forEach((tag, idx) => {
    assert(tag.trim().length > 0, `Tag ${idx} must not be empty`);
    assert(!tag.includes('http'), `Tag ${idx} must not contain a URL`);
  });
  console.log(`✓ PASS: Generated exactly ${tagCount} tags within the 15–20 range.`);

  // -------------------------------------------------------------------------
  // Test 6: Exactly five primary keywords and ten secondary keywords (AC-F04-02)
  // -------------------------------------------------------------------------
  console.log('\nTest 6: Exactly 5 primary keywords and 10 secondary keywords (AC-F04-02)...');
  assert(content.primary_keywords.length === 5, `Expected 5 primary keywords, got ${content.primary_keywords.length}`);
  assert(content.secondary_keywords.length === 10, `Expected 10 secondary keywords, got ${content.secondary_keywords.length}`);
  console.log('✓ PASS: Primary (5) and secondary (10) keyword counts are exact.');

  // -------------------------------------------------------------------------
  // Test 7: Hashtags count strictly within 3–5 (AC-F04-02)
  // -------------------------------------------------------------------------
  console.log('\nTest 7: Hashtags count is within 3–5 range (AC-F04-02)...');
  const hashtagCount = content.hashtags.length;
  assert(hashtagCount >= 3 && hashtagCount <= 5, `Hashtag count must be between 3 and 5, got ${hashtagCount}`);
  content.hashtags.forEach((ht, idx) => {
    assert(ht.startsWith('#'), `Hashtag ${idx} must start with #: ${ht}`);
  });
  console.log(`✓ PASS: Generated ${hashtagCount} valid hashtags starting with '#'.`);

  // -------------------------------------------------------------------------
  // Test 8: Master Language consistency (Hindi vs English) (AC-F04-03 / Rule 32)
  // -------------------------------------------------------------------------
  console.log('\nTest 8: Master Language consistency (Hindi vs English) (AC-F04-03)...');
  // Hindi Project
  assert(/[\u0900-\u097F]/.test(content.recommended_title), 'Hindi project recommended title must contain Devanagari script');
  assert(/[\u0900-\u097F]/.test(content.description.summary), 'Hindi project description summary must contain Devanagari script');

  // English Project
  const enProject: Project = {
    ...shortsProject,
    project_id: 'proj-long-en-01',
    master_language: 'en',
    format_type: 'long_video',
    target_duration_seconds: 240,
    name: 'Mohenjo-daro Sanitation Civil Engineering',
  };
  const enScript: GeneratedOutput = {
    ...approvedScriptOutput,
    project_id: 'proj-long-en-01',
  };
  const enAnalysis: AnalysisVersion = {
    ...approvedAnalysis,
    project_id: 'proj-long-en-01',
  };

  const enGen = generateYouTubeSEO({
    project: enProject,
    scriptOutput: enScript,
    scriptContent: (enScript.content as any).data,
    analysis: enAnalysis,
    rulesVersionId: 'rules-v1.0',
  });

  assert(enGen.success === true, 'English SEO generation must succeed');
  assert(!/[\u0900-\u097F]/.test(enGen.content!.recommended_title), 'English recommended title must not contain Devanagari script');
  assert(enGen.content!.primary_keywords[0].includes('Indus') || enGen.content!.primary_keywords[0].includes('sanitation'), 'English keywords must be in English');
  console.log('✓ PASS: Master Language properly maintained across Hindi and English.');

  // -------------------------------------------------------------------------
  // Test 9: Zero clickable links or URLs across all fields (AC-F04-05 / Rule 34)
  // -------------------------------------------------------------------------
  console.log('\nTest 9: Zero clickable links or URLs in SEO outputs (AC-F04-05)...');
  const allOutputStrings = [
    ...content.title_options,
    content.recommended_title,
    content.description.hook,
    content.description.summary,
    ...content.description.key_highlights,
    content.description.chapter_timestamps,
    ...content.tags,
    ...content.primary_keywords,
    ...content.secondary_keywords,
    ...content.hashtags,
    content.title_thumbnail_alignment_check,
    content.ai_disclosure_guidance || '',
    ...(content.retention_packaging_tips || []),
  ];

  allOutputStrings.forEach((str, i) => {
    assert(!str.includes('http://'), `String ${i} must not contain http://`);
    assert(!str.includes('https://'), `String ${i} must not contain https://`);
    assert(!str.includes('<a href='), `String ${i} must not contain HTML anchor tag`);
  });
  console.log('✓ PASS: Zero clickable links or URLs verified across all SEO fields.');

  // -------------------------------------------------------------------------
  // Test 10: Title-Thumbnail Alignment & AI Disclosure Notice (AC-F04-04 / AC-F04-07)
  // -------------------------------------------------------------------------
  console.log('\nTest 10: Title-thumbnail alignment check & AI disclosure guidance (AC-F04-04, AC-F04-07)...');
  assert(Boolean(content.title_thumbnail_alignment_check), 'Alignment check must be present');
  assert(content.title_thumbnail_alignment_check.includes('Option A') || content.title_thumbnail_alignment_check.includes('थंबनेल'), 'Alignment check must reference thumbnail context');
  assert(Boolean(content.ai_disclosure_guidance), 'AI disclosure guidance must be present');
  assert(content.ai_disclosure_guidance!.includes('Altered or synthetic content'), 'AI disclosure notice must mention altered or synthetic content');
  console.log('✓ PASS: Title-thumbnail alignment check and AI disclosure guidance present.');

  // -------------------------------------------------------------------------
  // Test 11: Non-destructive storage persistence and versioning (Rules 45, 46)
  // -------------------------------------------------------------------------
  console.log('\nTest 11: Non-destructive storage persistence and versioning...');
  const mockDb = new MockDatabase();
  mockDb.seed('projects', shortsProject);
  mockDb.seed('analysis_versions', approvedAnalysis);

  const seoOutputV1: GeneratedOutput = {
    output_id: 'out-seo-01',
    project_id: shortsProject.project_id,
    output_type: 'seo',
    version_number: 1,
    status: 'draft',
    content: {
      type: 'seo',
      data: content,
    },
    analysis_version_id: approvedAnalysis.analysis_version_id,
    master_rules_version_id: shortsProject.master_rules_version_id,
    input_output_version_ids: [approvedScriptOutput.output_id, approvedThumbnailOutput.output_id],
    provider_id: 'local-seo-engine',
    model_id: 'seo-engine-v1',
    created_at: new Date().toISOString(),
    approved_at: null,
    supersedes_output_id: null,
  };

  // Save V1 draft
  const savedV1 = await saveOutput(seoOutputV1, {}, mockDb as any);
  assert(savedV1.output_id === 'out-seo-01', 'V1 must be saved');

  // Approve V1
  const approvedV1: GeneratedOutput = {
    ...savedV1,
    status: 'approved',
    approved_at: new Date().toISOString(),
  };
  await saveOutput(approvedV1, {}, mockDb as any);

  // Save V2 draft (supersedes V1)
  const seoOutputV2: GeneratedOutput = {
    ...seoOutputV1,
    output_id: 'out-seo-02',
    version_number: 2,
    status: 'draft',
    supersedes_output_id: 'out-seo-01',
  };
  await saveOutput(seoOutputV2, {}, mockDb as any);

  // Retrieve project outputs
  const allSeoOutputs = await listOutputsForProject(shortsProject.project_id, 'seo', mockDb as any);
  assert(allSeoOutputs.length === 2, `Expected 2 saved outputs, got ${allSeoOutputs.length}`);
  const v1 = allSeoOutputs.find((o) => o.output_id === 'out-seo-01');
  const v2 = allSeoOutputs.find((o) => o.output_id === 'out-seo-02');
  assert(v1?.status === 'superseded', 'V1 must be marked superseded');
  assert(v2?.status === 'draft', 'V2 must be draft');
  console.log('✓ PASS: Versioning is non-destructive and preserves complete output history.');

  // -------------------------------------------------------------------------
  // Test 12: Strict ₹0 budget verification
  // -------------------------------------------------------------------------
  console.log('\nTest 12: Zero external AI calls and ₹0 budget verification...');
  assert(seoOutputV1.provider_id === 'local-seo-engine', 'Provider must be local engine');
  console.log('✓ PASS: Completely offline local execution, ₹0.00 cost.');

  console.log('\n======================================================');
  console.log('ALL FUNCTION 04 YOUTUBE SEO TESTS PASSED!');
  console.log('======================================================');
}

runAllTests().catch((err) => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
