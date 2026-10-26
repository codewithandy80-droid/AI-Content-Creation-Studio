import { 
  ProjectExportPackage, 
  Project, 
  Source, 
  AnalysisVersion, 
  ClaimRecord, 
  GeneratedOutput, 
  ResearchFinding, 
  MasterRulesVersion, 
  AuditEvent 
} from '../types';
import { openDatabase, STORES } from './db';
import { promisifyRequest, promisifyTransaction, getProject } from './projectRepository';
import { DEFAULT_MASTER_RULES_V1 } from '../constants/masterRules';

export interface RestoreValidationResult {
  valid: boolean;
  errors: string[];
  preview?: {
    project_id: string;
    project_name: string;
    master_language: string;
    aspect_ratio: string;
    source_count: number;
    analysis_count: number;
    output_count: number;
    findings_count: number;
    has_conflict: boolean;
    existing_project_name?: string;
  };
}

/**
 * Remove any secret or credential fields recursively (SEC-03)
 */
function sanitizeSecrets(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeSecrets);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Redact secret-bearing keys
    const lower = key.toLowerCase();
    if (
      lower.includes('secret') ||
      lower.includes('api_key') ||
      lower.includes('apikey') ||
      lower.includes('token') ||
      lower.includes('password')
    ) {
      continue; // completely exclude secret keys from export
    }
    sanitized[key] = sanitizeSecrets(value);
  }
  return sanitized;
}

/**
 * Export a complete project package (excluding all secrets and credentials)
 */
export async function exportProjectPackage(
  projectId: string,
  customDb?: IDBDatabase
): Promise<ProjectExportPackage> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(
    [
      STORES.PROJECTS,
      STORES.SOURCES,
      STORES.ANALYSIS_VERSIONS,
      STORES.CLAIM_RECORDS,
      STORES.GENERATED_OUTPUTS,
      STORES.RESEARCH_FINDINGS,
      STORES.MASTER_RULES,
      STORES.AUDIT_EVENTS,
    ],
    'readonly'
  );

  const project = await promisifyRequest(tx.objectStore(STORES.PROJECTS).get(projectId)) as Project | undefined;
  if (!project) {
    throw new Error(`Project ${projectId} not found for export`);
  }

  const sources = await promisifyRequest(
    tx.objectStore(STORES.SOURCES).index('project_id').getAll(projectId)
  ) as Source[];

  const analyses = await promisifyRequest(
    tx.objectStore(STORES.ANALYSIS_VERSIONS).index('project_id').getAll(projectId)
  ) as AnalysisVersion[];

  // Attach claims to analysis
  const fullAnalyses: AnalysisVersion[] = [];
  const claimStore = tx.objectStore(STORES.CLAIM_RECORDS);
  for (const a of analyses) {
    const claims = await promisifyRequest(
      claimStore.index('analysis_version_id').getAll(a.analysis_version_id)
    ) as ClaimRecord[];
    fullAnalyses.push({ ...a, claim_records: claims });
  }

  const outputs = await promisifyRequest(
    tx.objectStore(STORES.GENERATED_OUTPUTS).index('project_id').getAll(projectId)
  ) as GeneratedOutput[];

  const findings = await promisifyRequest(
    tx.objectStore(STORES.RESEARCH_FINDINGS).index('project_id').getAll(projectId)
  ) as ResearchFinding[];

  const auditEvents = await promisifyRequest(
    tx.objectStore(STORES.AUDIT_EVENTS).index('project_id').getAll(projectId)
  ) as AuditEvent[];

  const rawPackage: ProjectExportPackage = {
    package_version: '1.0',
    exported_at: new Date().toISOString(),
    project,
    sources,
    analyses: fullAnalyses,
    outputs,
    research_findings: findings,
    master_rules_version: DEFAULT_MASTER_RULES_V1,
    audit_trail: auditEvents,
  };

  // Run thorough recursive sanitization to guarantee no secrets exist
  return sanitizeSecrets(rawPackage) as ProjectExportPackage;
}

/**
 * Validate imported JSON backup structure and check for existing conflicts before restore
 * (Never modifies database; returns validation status and preview data only)
 */
export async function validateRestorePackage(
  rawInput: unknown,
  customDb?: IDBDatabase
): Promise<RestoreValidationResult> {
  const errors: string[] = [];

  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return { valid: false, errors: ['Imported file is not a valid JSON object'] };
  }

  const pkg = rawInput as Partial<ProjectExportPackage>;

  if (pkg.package_version !== '1.0') {
    errors.push(`Unsupported or missing package_version (expected '1.0', got '${pkg.package_version}')`);
  }

  if (!pkg.project || typeof pkg.project !== 'object') {
    errors.push('Missing project record in import package');
  } else {
    const p = pkg.project as Partial<Project>;
    if (!p.project_id || typeof p.project_id !== 'string') errors.push('Invalid or missing project_id');
    if (!p.name || typeof p.name !== 'string') errors.push('Invalid or missing project name');
    if (p.master_language !== 'hi' && p.master_language !== 'en') errors.push('Invalid master_language (must be "hi" or "en")');
    if (p.aspect_ratio !== '9:16' && p.aspect_ratio !== '16:9') errors.push('Invalid aspect_ratio (must be "9:16" or "16:9")');
    if (p.format_type !== 'shorts' && p.format_type !== 'long_video') errors.push('Invalid format_type');
  }

  if (!Array.isArray(pkg.sources)) errors.push('Missing or invalid sources array');
  if (!Array.isArray(pkg.analyses)) errors.push('Missing or invalid analyses array');
  if (!Array.isArray(pkg.outputs)) errors.push('Missing or invalid outputs array');

  // Security check: scan for unauthorized secret keys in import
  const rawString = JSON.stringify(rawInput);
  if (/("api_key"|"secret_key"|"password"|"token")/i.test(rawString)) {
    errors.push('Security violation: import file contains forbidden credential/secret keys');
  }

  if (errors.length > 0 || !pkg.project) {
    return { valid: false, errors };
  }

  // Check for local project conflict
  const existingProject = await getProject(pkg.project.project_id, customDb);
  const hasConflict = !!existingProject;

  return {
    valid: true,
    errors: [],
    preview: {
      project_id: pkg.project.project_id,
      project_name: pkg.project.name,
      master_language: pkg.project.master_language,
      aspect_ratio: pkg.project.aspect_ratio,
      source_count: pkg.sources?.length || 0,
      analysis_count: pkg.analyses?.length || 0,
      output_count: pkg.outputs?.length || 0,
      findings_count: pkg.research_findings?.length || 0,
      has_conflict: hasConflict,
      existing_project_name: existingProject?.name,
    },
  };
}

/**
 * Execute restore with explicit conflict resolution
 * Refuses to overwrite unless options.explicitReplaceConfirmed is true.
 */
export async function executeRestorePackage(
  pkg: ProjectExportPackage,
  options: { explicitReplaceConfirmed?: boolean; importAsNewId?: string } = {},
  customDb?: IDBDatabase
): Promise<Project> {
  const validation = await validateRestorePackage(pkg, customDb);
  if (!validation.valid || !validation.preview) {
    throw new Error(`Cannot restore invalid package: ${validation.errors.join('; ')}`);
  }

  if (validation.preview.has_conflict && !options.explicitReplaceConfirmed && !options.importAsNewId) {
    throw new Error(`Project conflict detected for ID '${pkg.project.project_id}'. Explicit replacement or new ID required.`);
  }

  const db = customDb || await openDatabase();
  const tx = db.transaction(
    [
      STORES.PROJECTS,
      STORES.SOURCES,
      STORES.ANALYSIS_VERSIONS,
      STORES.CLAIM_RECORDS,
      STORES.GENERATED_OUTPUTS,
      STORES.RESEARCH_FINDINGS,
      STORES.AUDIT_EVENTS,
    ],
    'readwrite'
  );

  const targetProjectId = options.importAsNewId || pkg.project.project_id;
  const projectToSave: Project = {
    ...pkg.project,
    project_id: targetProjectId,
    last_activity_at: new Date().toISOString(),
  };

  await promisifyRequest(tx.objectStore(STORES.PROJECTS).put(projectToSave));

  for (const s of pkg.sources) {
    await promisifyRequest(tx.objectStore(STORES.SOURCES).put({ ...s, project_id: targetProjectId }));
  }

  for (const a of pkg.analyses) {
    await promisifyRequest(tx.objectStore(STORES.ANALYSIS_VERSIONS).put({ ...a, project_id: targetProjectId }));
    if (a.claim_records) {
      for (const c of a.claim_records) {
        await promisifyRequest(tx.objectStore(STORES.CLAIM_RECORDS).put(c));
      }
    }
  }

  for (const o of pkg.outputs) {
    await promisifyRequest(tx.objectStore(STORES.GENERATED_OUTPUTS).put({ ...o, project_id: targetProjectId }));
  }

  if (pkg.research_findings) {
    for (const f of pkg.research_findings) {
      await promisifyRequest(tx.objectStore(STORES.RESEARCH_FINDINGS).put({ ...f, project_id: targetProjectId }));
    }
  }

  const restoreAudit: AuditEvent = {
    event_id: `audit-restore-${Date.now()}`,
    project_id: targetProjectId,
    event_type: 'restore',
    actor_id: null,
    timestamp: new Date().toISOString(),
    target_version_ids: [pkg.package_version],
    result_status: 'restore_completed',
    safe_details: { project_name: projectToSave.name, replaced: !!options.explicitReplaceConfirmed },
  };
  await promisifyRequest(tx.objectStore(STORES.AUDIT_EVENTS).put(restoreAudit));

  await promisifyTransaction(tx);
  return projectToSave;
}
