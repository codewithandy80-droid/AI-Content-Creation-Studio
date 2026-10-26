/**
 * Browser-Native IndexedDB Configuration
 * Compliant with 13_MEMORY_VERSIONING_BACKUP_AND_RESTORE.md and 17_GLOSSARY_AND_DATA_STRUCTURES.md
 * Strict ₹0 budget: native browser IndexedDB only.
 */

export const DB_NAME = 'AIContentCreationStudioDB';
export const DB_VERSION = 1;

export const STORES = {
  PROJECTS: 'projects',
  SOURCES: 'sources',
  ANALYSIS_VERSIONS: 'analysis_versions',
  CLAIM_RECORDS: 'claim_records',
  GENERATED_OUTPUTS: 'generated_outputs',
  RESEARCH_FINDINGS: 'research_findings',
  MASTER_RULES: 'master_rules',
  PROVIDER_CONFIGS: 'provider_configs',
  AUDIT_EVENTS: 'audit_events',
} as const;

/**
 * Get an active IndexedDB connection using standard browser APIs
 */
export function openDatabase(customIndexedDB?: IDBFactory): Promise<IDBDatabase> {
  const idb = customIndexedDB || (typeof window !== 'undefined' ? window.indexedDB : (globalThis as unknown as { indexedDB: IDBFactory }).indexedDB);

  if (!idb) {
    return Promise.reject(new Error('IndexedDB is not supported in this runtime environment.'));
  }

  return new Promise((resolve, reject) => {
    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // 1. Projects Store (Key: project_id)
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'project_id' });
        projectStore.createIndex('last_activity_at', 'last_activity_at', { unique: false });
        projectStore.createIndex('created_at', 'created_at', { unique: false });
        projectStore.createIndex('project_status', 'project_status', { unique: false });
      }

      // 2. Sources Store (Key: source_id)
      if (!db.objectStoreNames.contains(STORES.SOURCES)) {
        const sourceStore = db.createObjectStore(STORES.SOURCES, { keyPath: 'source_id' });
        sourceStore.createIndex('project_id', 'project_id', { unique: false });
      }

      // 3. Analysis Versions Store (Key: analysis_version_id)
      if (!db.objectStoreNames.contains(STORES.ANALYSIS_VERSIONS)) {
        const analysisStore = db.createObjectStore(STORES.ANALYSIS_VERSIONS, { keyPath: 'analysis_version_id' });
        analysisStore.createIndex('project_id', 'project_id', { unique: false });
        analysisStore.createIndex('review_status', 'review_status', { unique: false });
      }

      // 4. Claim Records Store (Key: claim_id)
      if (!db.objectStoreNames.contains(STORES.CLAIM_RECORDS)) {
        const claimStore = db.createObjectStore(STORES.CLAIM_RECORDS, { keyPath: 'claim_id' });
        claimStore.createIndex('analysis_version_id', 'analysis_version_id', { unique: false });
        claimStore.createIndex('project_id', 'project_id', { unique: false });
        claimStore.createIndex('status', 'status', { unique: false });
      }

      // 5. Generated Outputs Store (Key: output_id)
      if (!db.objectStoreNames.contains(STORES.GENERATED_OUTPUTS)) {
        const outputStore = db.createObjectStore(STORES.GENERATED_OUTPUTS, { keyPath: 'output_id' });
        outputStore.createIndex('project_id', 'project_id', { unique: false });
        outputStore.createIndex('output_type', 'output_type', { unique: false });
        outputStore.createIndex('status', 'status', { unique: false });
      }

      // 6. Research Findings Store (Key: finding_id)
      if (!db.objectStoreNames.contains(STORES.RESEARCH_FINDINGS)) {
        const researchStore = db.createObjectStore(STORES.RESEARCH_FINDINGS, { keyPath: 'finding_id' });
        researchStore.createIndex('project_id', 'project_id', { unique: false });
      }

      // 7. Master Rules Versions Store (Key: master_rules_version_id)
      if (!db.objectStoreNames.contains(STORES.MASTER_RULES)) {
        db.createObjectStore(STORES.MASTER_RULES, { keyPath: 'master_rules_version_id' });
      }

      // 8. Provider Configurations Store (Key: provider_id)
      if (!db.objectStoreNames.contains(STORES.PROVIDER_CONFIGS)) {
        db.createObjectStore(STORES.PROVIDER_CONFIGS, { keyPath: 'provider_id' });
      }

      // 9. Audit Events Store (Key: event_id)
      if (!db.objectStoreNames.contains(STORES.AUDIT_EVENTS)) {
        const auditStore = db.createObjectStore(STORES.AUDIT_EVENTS, { keyPath: 'event_id' });
        auditStore.createIndex('project_id', 'project_id', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open database'));
  });
}
