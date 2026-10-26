import { AnalysisVersion, ClaimRecord, Project } from '../types';
import { openDatabase, STORES } from './db';
import { promisifyRequest, promisifyTransaction } from './projectRepository';

/**
 * Save an AnalysisVersion and its ClaimRecords atomically
 */
export async function saveAnalysisVersion(
  analysis: AnalysisVersion,
  customDb?: IDBDatabase
): Promise<AnalysisVersion> {
  const db = customDb || await openDatabase();
  const tx = db.transaction([STORES.ANALYSIS_VERSIONS, STORES.CLAIM_RECORDS, STORES.PROJECTS], 'readwrite');
  const analysisStore = tx.objectStore(STORES.ANALYSIS_VERSIONS);
  const claimStore = tx.objectStore(STORES.CLAIM_RECORDS);
  const projectStore = tx.objectStore(STORES.PROJECTS);

  const project = await promisifyRequest(projectStore.get(analysis.project_id)) as Project | undefined;
  if (!project) {
    throw new Error(`Project ${analysis.project_id} does not exist`);
  }

  // Save the analysis entity
  await promisifyRequest(analysisStore.put(analysis));

  // Save individual claim records
  if (analysis.claim_records && analysis.claim_records.length > 0) {
    for (const claim of analysis.claim_records) {
      await promisifyRequest(claimStore.put(claim));
    }
  }

  await promisifyTransaction(tx);
  return analysis;
}

/**
 * Get an AnalysisVersion along with its associated ClaimRecords
 */
export async function getAnalysisVersion(
  analysisVersionId: string,
  customDb?: IDBDatabase
): Promise<AnalysisVersion | null> {
  const db = customDb || await openDatabase();
  const tx = db.transaction([STORES.ANALYSIS_VERSIONS, STORES.CLAIM_RECORDS], 'readonly');
  const analysisStore = tx.objectStore(STORES.ANALYSIS_VERSIONS);
  const claimStore = tx.objectStore(STORES.CLAIM_RECORDS);

  const analysis = await promisifyRequest(analysisStore.get(analysisVersionId)) as AnalysisVersion | undefined;
  if (!analysis) return null;

  const claimIndex = claimStore.index('analysis_version_id');
  const claims = await promisifyRequest(claimIndex.getAll(analysisVersionId)) as ClaimRecord[];

  return {
    ...analysis,
    claim_records: claims,
  };
}

/**
 * List all analysis versions for a specific project
 */
export async function listAnalysesForProject(
  projectId: string,
  customDb?: IDBDatabase
): Promise<AnalysisVersion[]> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(STORES.ANALYSIS_VERSIONS, 'readonly');
  const store = tx.objectStore(STORES.ANALYSIS_VERSIONS);
  const index = store.index('project_id');
  const versions = await promisifyRequest(index.getAll(projectId)) as AnalysisVersion[];
  return versions.sort((a, b) => a.version_number - b.version_number);
}

/**
 * Explicitly approve an analysis version
 * Updates project.active_approved_analysis_version_id and transitions prior approved analysis to 'superseded'
 * (Preserves complete historical record - never silently overwrites or deletes!)
 */
export async function approveAnalysisVersion(
  analysisVersionId: string,
  customDb?: IDBDatabase
): Promise<AnalysisVersion> {
  const db = customDb || await openDatabase();
  const tx = db.transaction([STORES.ANALYSIS_VERSIONS, STORES.PROJECTS], 'readwrite');
  const analysisStore = tx.objectStore(STORES.ANALYSIS_VERSIONS);
  const projectStore = tx.objectStore(STORES.PROJECTS);

  const targetAnalysis = await promisifyRequest(analysisStore.get(analysisVersionId)) as AnalysisVersion | undefined;
  if (!targetAnalysis) {
    throw new Error(`AnalysisVersion ${analysisVersionId} not found`);
  }

  const project = await promisifyRequest(projectStore.get(targetAnalysis.project_id)) as Project | undefined;
  if (!project) {
    throw new Error(`Project ${targetAnalysis.project_id} not found`);
  }

  // If there was an existing approved analysis version, mark it as superseded
  if (project.active_approved_analysis_version_id && project.active_approved_analysis_version_id !== analysisVersionId) {
    const prevApproved = await promisifyRequest(
      analysisStore.get(project.active_approved_analysis_version_id)
    ) as AnalysisVersion | undefined;
    if (prevApproved) {
      await promisifyRequest(
        analysisStore.put({
          ...prevApproved,
          review_status: 'superseded',
        })
      );
    }
  }

  const now = new Date().toISOString();
  const approvedAnalysis: AnalysisVersion = {
    ...targetAnalysis,
    review_status: 'approved',
    approved_at: now,
    supersedes_analysis_version_id: project.active_approved_analysis_version_id,
  };

  await promisifyRequest(analysisStore.put(approvedAnalysis));

  // Update project's active approved analysis reference and last activity
  const updatedProject: Project = {
    ...project,
    active_approved_analysis_version_id: analysisVersionId,
    last_activity_at: now,
  };
  await promisifyRequest(projectStore.put(updatedProject));

  await promisifyTransaction(tx);
  return approvedAnalysis;
}
