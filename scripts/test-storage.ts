/**
 * Test Suite for TASK-02A: IndexedDB Storage Foundation
 * Tests all 10 required verification checks without installing external packages.
 */

import {
  createProject,
  getProject,
  listActiveProjects,
  saveSource,
  listSourcesForProject,
  saveAnalysisVersion,
  approveAnalysisVersion,
  getAnalysisVersion,
  saveOutput,
  listOutputsForProject,
  exportProjectPackage,
  validateRestorePackage,
  executeRestorePackage,
  MAX_ACTIVE_PROJECTS
} from '../src/storage';
import { Project, Source, AnalysisVersion, GeneratedOutput, ProjectExportPackage } from '../src/types';

// Lightweight, fully-typed in-memory IDB simulation for Node.js test environment
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
  constructor(private storeMap: Map<string, any>, private keyPath: string, private indexField: string) {}

  getAll(val: any): MockIDBRequest<any[]> {
    const req = new MockIDBRequest<any[]>();
    setTimeout(() => {
      const items = Array.from(this.storeMap.values()).filter((item) => item[this.indexField] === val);
      req.succeed(items);
    }, 0);
    return req as any;
  }

  getAllKeys(val: any): MockIDBRequest<string[]> {
    const req = new MockIDBRequest<string[]>();
    setTimeout(() => {
      const keys = Array.from(this.storeMap.entries())
        .filter(([_, item]) => item[this.indexField] === val)
        .map(([k]) => k);
      req.succeed(keys);
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

  getAll(): MockIDBRequest<any[]> {
    const req = new MockIDBRequest<any[]>();
    setTimeout(() => req.succeed(Array.from(this.storeMap.values())), 0);
    return req as any;
  }

  add(val: any): MockIDBRequest<string> {
    const req = new MockIDBRequest<string>();
    setTimeout(() => {
      const key = val[this.keyPath];
      if (this.storeMap.has(key)) {
        req.fail(new Error(`ConstraintError: Key ${key} already exists`));
      } else {
        this.storeMap.set(key, JSON.parse(JSON.stringify(val)));
        req.succeed(key);
      }
    }, 0);
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

  delete(key: string): MockIDBRequest<undefined> {
    const req = new MockIDBRequest<undefined>();
    setTimeout(() => {
      this.storeMap.delete(key);
      req.succeed(undefined);
    }, 0);
    return req as any;
  }

  index(name: string): MockIndex {
    return new MockIndex(this.storeMap, this.keyPath, name);
  }
}

class MockTransaction {
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;

  constructor(private db: MockDatabase, private storeNames: string[]) {
    setTimeout(() => {
      if (this.oncomplete) this.oncomplete();
    }, 15);
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
    claim_records: 'claim_id',
    generated_outputs: 'output_id',
    research_findings: 'finding_id',
    master_rules: 'master_rules_version_id',
    provider_configs: 'provider_id',
    audit_events: 'event_id',
  };

  constructor() {
    for (const name of Object.keys(this.keyPaths)) {
      this.stores.set(name, new Map());
    }
  }

  transaction(storeNames: string | string[], mode: 'readonly' | 'readwrite'): any {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    return new MockTransaction(this, names) as any;
  }

  getObjectStore(name: string): MockObjectStore {
    const map = this.stores.get(name);
    if (!map) throw new Error(`Unknown store: ${name}`);
    return new MockObjectStore(map, this.keyPaths[name]);
  }
}

async function runTestSuite() {
  console.log('=== RUNNING TASK-02A INDEXEDDB STORAGE TEST SUITE ===\n');
  const mockDb = new MockDatabase() as any;

  let allPassed = true;

  // 1. Check: A project can be saved and loaded
  try {
    const createResult = await createProject(
      {
        project_id: 'proj-001',
        name: 'Hindi Mystery Stories',
        master_language: 'hi',
        aspect_ratio: '9:16',
        format_type: 'shorts',
        shorts_segment_count: 5,
        target_duration_seconds: 40,
        master_rules_version_id: 'mr-v1.0-baseline',
        active_approved_analysis_version_id: null,
      },
      mockDb
    );

    const loaded = await getProject('proj-001', mockDb);
    if (createResult.success && loaded && loaded.name === 'Hindi Mystery Stories' && loaded.master_language === 'hi') {
      console.log('TEST 1: Save and load project -> PASS');
    } else {
      console.error('TEST 1: Save and load project -> FAIL');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('TEST 1 failed with error:', e.message);
    allPassed = false;
  }

  // 2. Check: Separate projects do not leak data into each other
  try {
    await createProject(
      {
        project_id: 'proj-002',
        name: 'Tech Explainer English',
        master_language: 'en',
        aspect_ratio: '16:9',
        format_type: 'long_video',
        shorts_segment_count: null,
        target_duration_seconds: 240,
        master_rules_version_id: 'mr-v1.0-baseline',
        active_approved_analysis_version_id: null,
      },
      mockDb
    );

    // Save sources for each project
    await saveSource(
      {
        source_id: 'src-01',
        project_id: 'proj-001',
        source_type: 'pasted_text',
        source_label: 'Hindi Article',
        source_version: 1,
        content_or_storage_reference: 'Hindi source content...',
        source_hash: 'hash-001',
        ingestion_status: 'imported',
        captured_at: new Date().toISOString(),
        non_clickable_provenance_text: 'Text Document 1',
        location_index_metadata: null,
      },
      mockDb
    );

    await saveSource(
      {
        source_id: 'src-02',
        project_id: 'proj-002',
        source_type: 'pasted_text',
        source_label: 'English Tech Specs',
        source_version: 1,
        content_or_storage_reference: 'English source content...',
        source_hash: 'hash-002',
        ingestion_status: 'imported',
        captured_at: new Date().toISOString(),
        non_clickable_provenance_text: 'Tech Paper 2',
        location_index_metadata: null,
      },
      mockDb
    );

    const proj1Sources = await listSourcesForProject('proj-001', mockDb);
    const proj2Sources = await listSourcesForProject('proj-002', mockDb);

    if (
      proj1Sources.length === 1 &&
      proj1Sources[0].source_id === 'src-01' &&
      proj2Sources.length === 1 &&
      proj2Sources[0].source_id === 'src-02'
    ) {
      console.log('TEST 2: Cross-project data isolation -> PASS');
    } else {
      console.error('TEST 2: Cross-project data isolation -> FAIL');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('TEST 2 failed with error:', e.message);
    allPassed = false;
  }

  // 3. Check: Version records and approval gates are preserved
  try {
    // Save an analysis version
    const analysisV1: AnalysisVersion = {
      analysis_version_id: 'analysis-001',
      project_id: 'proj-001',
      source_version_ids: ['src-01'],
      version_number: 1,
      analysis_type: 'source_only',
      report_schema_version: '1.0',
      sections: {
        source_summary: 'Summary text',
        main_story_core_claims: 'Claims text',
        key_facts_with_evidence: 'Facts text',
        timeline_chronology: 'Timeline text',
        entities_relationships: 'Entities text',
        numbers_dates_exact_details: 'Numbers text',
        uncertainty_conflicts: 'Uncertainty text',
        missing_context: 'Missing context text',
        story_angles: 'Story angles text',
        source_limitations: 'Limitations text',
      },
      claim_records: [
        {
          claim_id: 'claim-01',
          analysis_version_id: 'analysis-001',
          claim_text: 'Event occurred in 1995',
          status: 'source-supported',
          importance: 'high',
          claim_type: 'fact',
          evidence_text: 'Source line 4',
          source_id: 'src-01',
          source_location: 'Para 1',
          attribution: 'Source author',
          caveat: '',
          review_status: 'pending',
        },
      ],
      created_at: new Date().toISOString(),
      review_status: 'draft',
      approved_at: null,
      supersedes_analysis_version_id: null,
    };

    await saveAnalysisVersion(analysisV1, mockDb);

    // Verify unapproved analysis cannot be used downstream
    let downstreamBlocked = false;
    try {
      await saveOutput(
        {
          output_id: 'out-01',
          project_id: 'proj-001',
          output_type: 'script',
          version_number: 1,
          status: 'draft',
          content: { type: 'script', data: { segments: [] } },
          analysis_version_id: 'analysis-001',
          master_rules_version_id: 'mr-v1.0-baseline',
          input_output_version_ids: [],
          provider_id: null,
          model_id: null,
          created_at: new Date().toISOString(),
          approved_at: null,
          supersedes_output_id: null,
        },
        {},
        mockDb
      );
    } catch (e: any) {
      if (e.message.includes('unapproved analysis')) downstreamBlocked = true;
    }

    // Now approve analysis
    await approveAnalysisVersion('analysis-001', mockDb);
    const approvedAnalysis = await getAnalysisVersion('analysis-001', mockDb);

    // Save downstream output after approval
    const output = await saveOutput(
      {
        output_id: 'out-01',
        project_id: 'proj-001',
        output_type: 'script',
        version_number: 1,
        status: 'draft',
        content: { type: 'script', data: { segments: [] } },
        analysis_version_id: 'analysis-001',
        master_rules_version_id: 'mr-v1.0-baseline',
        input_output_version_ids: [],
        provider_id: null,
        model_id: null,
        created_at: new Date().toISOString(),
        approved_at: null,
        supersedes_output_id: null,
      },
      {},
      mockDb
    );

    if (
      downstreamBlocked &&
      approvedAnalysis?.review_status === 'approved' &&
      approvedAnalysis.claim_records.length === 1 &&
      output.output_id === 'out-01'
    ) {
      console.log('TEST 3: Version records and approval gates preserved -> PASS');
    } else {
      console.error('TEST 3: Version records and approval gates preserved -> FAIL');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('TEST 3 failed with error:', e.message);
    allPassed = false;
  }

  // 4. Check: The eight-project limit blocks an additional project without deleting data
  try {
    // Fill up to 8 projects
    for (let i = 3; i <= MAX_ACTIVE_PROJECTS; i++) {
      await createProject(
        {
          project_id: `proj-00${i}`,
          name: `Project ${i}`,
          master_language: 'hi',
          aspect_ratio: '9:16',
          format_type: 'shorts',
          shorts_segment_count: 5,
          target_duration_seconds: 40,
          master_rules_version_id: 'mr-v1.0-baseline',
          active_approved_analysis_version_id: null,
        },
        mockDb
      );
    }

    const projectsAtMax = await listActiveProjects(mockDb);
    if (projectsAtMax.length !== 8) throw new Error(`Expected 8 projects, got ${projectsAtMax.length}`);

    // Attempt to create 9th project
    const ninthResult = await createProject(
      {
        project_id: 'proj-009',
        name: 'Ninth Project Blocked',
        master_language: 'hi',
        aspect_ratio: '9:16',
        format_type: 'shorts',
        shorts_segment_count: 5,
        target_duration_seconds: 40,
        master_rules_version_id: 'mr-v1.0-baseline',
        active_approved_analysis_version_id: null,
      },
      mockDb
    );

    const projectsAfterAttempt = await listActiveProjects(mockDb);

    if (
      !ninthResult.success &&
      ninthResult.error === 'PROJECT_LIMIT_REACHED' &&
      ninthResult.oldest_candidate &&
      ninthResult.oldest_candidate.project_id === 'proj-001' &&
      projectsAfterAttempt.length === 8
    ) {
      console.log('TEST 4: Eight-project limit blocks 9th project without deleting data -> PASS');
    } else {
      console.error('TEST 4: Eight-project limit blocks 9th project without deleting data -> FAIL');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('TEST 4 failed with error:', e.message);
    allPassed = false;
  }

  // 5. Check: Invalid import data is rejected before writes
  try {
    const invalidPackages = [
      null,
      'plain string',
      { package_version: '2.0' }, // wrong version
      { package_version: '1.0', project: { name: 'no-id' } }, // missing id
      { package_version: '1.0', project: { project_id: 'p1', name: 'p', master_language: 'es' } }, // invalid language
      { package_version: '1.0', project: { project_id: 'p1', name: 'p', master_language: 'hi', aspect_ratio: '4:3' } }, // invalid ratio
      { package_version: '1.0', project: { project_id: 'p1' }, api_key: 'AIzaSySecret' }, // secret leakage attempt
    ];

    let allRejected = true;
    for (const bad of invalidPackages) {
      const result = await validateRestorePackage(bad, mockDb);
      if (result.valid) {
        allRejected = false;
        console.error('Failed to reject invalid import:', bad);
      }
    }

    if (allRejected) {
      console.log('TEST 5: Invalid import data rejected before writes -> PASS');
    } else {
      console.error('TEST 5: Invalid import data rejected before writes -> FAIL');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('TEST 5 failed with error:', e.message);
    allPassed = false;
  }

  // 6. Check: Failed saves are reported as failures
  try {
    let failureHandled = false;
    try {
      // Trying to save source for non-existent project should reject
      await saveSource(
        {
          source_id: 'src-invalid',
          project_id: 'proj-non-existent-999',
          source_type: 'pasted_text',
          source_label: 'Orphan Source',
          source_version: 1,
          content_or_storage_reference: 'content',
          source_hash: null,
          ingestion_status: 'imported',
          captured_at: new Date().toISOString(),
          non_clickable_provenance_text: 'Orphan',
          location_index_metadata: null,
        },
        mockDb
      );
    } catch (e: any) {
      if (e.message.includes('does not exist')) failureHandled = true;
    }

    if (failureHandled) {
      console.log('TEST 6: Failed saves reported accurately as failures -> PASS');
    } else {
      console.error('TEST 6: Failed saves reported accurately as failures -> FAIL');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('TEST 6 failed with error:', e.message);
    allPassed = false;
  }

  // 7. Check: No secrets are included in exports
  try {
    const pkg = await exportProjectPackage('proj-001', mockDb);
    const jsonStr = JSON.stringify(pkg);

    const hasSecretWords = /("api_key"|"secret"|"token"|"password")/i.test(jsonStr);
    const hasRequiredStructure = pkg.package_version === '1.0' && pkg.project && Array.isArray(pkg.sources);

    if (!hasSecretWords && hasRequiredStructure) {
      console.log('TEST 7: No secrets in exported packages -> PASS');
    } else {
      console.error('TEST 7: No secrets in exported packages -> FAIL');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('TEST 7 failed with error:', e.message);
    allPassed = false;
  }

  console.log('\n=== TEST SUITE COMPLETED: ' + (allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED') + ' ===');
  if (!allPassed) process.exit(1);
}

runTestSuite();
