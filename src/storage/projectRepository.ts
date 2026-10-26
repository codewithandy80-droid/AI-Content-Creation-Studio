import { Project, AuditEvent } from '../types';
import { openDatabase, STORES } from './db';

export const MAX_ACTIVE_PROJECTS = 8;

export interface CreateProjectResult {
  success: boolean;
  project?: Project;
  error?: string;
  oldest_candidate?: Project;
  active_count?: number;
}

/**
 * Helper to wrap IDBRequest in a typed Promise
 */
export function promisifyRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IDBRequest failed'));
  });
}

/**
 * Helper to wrap IDBTransaction completion in a Promise
 */
export function promisifyTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('IDBTransaction failed'));
    tx.onabort = () => reject(tx.error || new Error('IDBTransaction aborted'));
  });
}

/**
 * List all non-deleted projects
 */
export async function listActiveProjects(customDb?: IDBDatabase): Promise<Project[]> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(STORES.PROJECTS, 'readonly');
  const store = tx.objectStore(STORES.PROJECTS);
  const projects = await promisifyRequest(store.getAll()) as Project[];
  
  return projects
    .filter((p) => p.project_status !== 'deleted')
    .sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime());
}

/**
 * Find the oldest candidate project (based on both created_at and last_activity_at)
 */
export function identifyOldestProject(projects: Project[]): Project | undefined {
  if (projects.length === 0) return undefined;
  return [...projects].sort((a, b) => {
    // Primary sort: created_at (oldest project by creation), secondary: last_activity_at
    const createdDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (createdDiff !== 0) return createdDiff;
    return new Date(a.last_activity_at).getTime() - new Date(b.last_activity_at).getTime();
  })[0];
}

/**
 * Create a new project with strict 8-project safety limit check
 * Never automatically deletes data. If limit is reached, returns a blocked result with the oldest candidate.
 */
export async function createProject(
  projectData: Omit<Project, 'created_at' | 'last_activity_at' | 'project_status'> & {
    created_at?: string;
    last_activity_at?: string;
    project_status?: 'active' | 'archived' | 'deleted';
  },
  customDb?: IDBDatabase
): Promise<CreateProjectResult> {
  const db = customDb || await openDatabase();
  const activeProjects = await listActiveProjects(db);

  if (activeProjects.length >= MAX_ACTIVE_PROJECTS) {
    const oldestCandidate = identifyOldestProject(activeProjects);
    return {
      success: false,
      error: 'PROJECT_LIMIT_REACHED',
      active_count: activeProjects.length,
      oldest_candidate: oldestCandidate,
    };
  }

  const now = new Date().toISOString();
  const newProject: Project = {
    ...projectData,
    created_at: projectData.created_at || now,
    last_activity_at: projectData.last_activity_at || now,
    project_status: projectData.project_status || 'active',
  };

  const tx = db.transaction([STORES.PROJECTS, STORES.AUDIT_EVENTS], 'readwrite');
  const projectStore = tx.objectStore(STORES.PROJECTS);
  const auditStore = tx.objectStore(STORES.AUDIT_EVENTS);

  await promisifyRequest(projectStore.add(newProject));

  const auditEvent: AuditEvent = {
    event_id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    project_id: newProject.project_id,
    event_type: 'approval',
    actor_id: null,
    timestamp: now,
    target_version_ids: [newProject.master_rules_version_id],
    result_status: 'project_created',
    safe_details: { project_name: newProject.name, format: newProject.format_type },
  };
  await promisifyRequest(auditStore.add(auditEvent));
  await promisifyTransaction(tx);

  return {
    success: true,
    project: newProject,
    active_count: activeProjects.length + 1,
  };
}

/**
 * Retrieve a project by its unique ID
 */
export async function getProject(projectId: string, customDb?: IDBDatabase): Promise<Project | null> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(STORES.PROJECTS, 'readonly');
  const store = tx.objectStore(STORES.PROJECTS);
  const project = await promisifyRequest(store.get(projectId)) as Project | undefined;
  return project || null;
}

/**
 * Update project fields while updating last_activity_at
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'project_id' | 'created_at'>>,
  customDb?: IDBDatabase
): Promise<Project> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(STORES.PROJECTS, 'readwrite');
  const store = tx.objectStore(STORES.PROJECTS);

  const existing = await promisifyRequest(store.get(projectId)) as Project | undefined;
  if (!existing) {
    throw new Error(`Project ${projectId} not found`);
  }

  const updated: Project = {
    ...existing,
    ...updates,
    last_activity_at: new Date().toISOString(),
  };

  await promisifyRequest(store.put(updated));
  await promisifyTransaction(tx);
  return updated;
}

/**
 * Delete a project and its project-scoped data only.
 * Permanent Master Rules and Provider Settings are strictly preserved (Rule 60).
 */
export async function deleteProject(projectId: string, customDb?: IDBDatabase): Promise<void> {
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

  // 1. Delete project record
  await promisifyRequest(tx.objectStore(STORES.PROJECTS).delete(projectId));

  // Helper to delete records by project_id index
  const deleteFromIndex = async (storeName: string) => {
    const store = tx.objectStore(storeName);
    const index = store.index('project_id');
    const records = await promisifyRequest(index.getAllKeys(projectId));
    for (const key of records) {
      await promisifyRequest(store.delete(key));
    }
  };

  await deleteFromIndex(STORES.SOURCES);
  await deleteFromIndex(STORES.ANALYSIS_VERSIONS);
  await deleteFromIndex(STORES.CLAIM_RECORDS);
  await deleteFromIndex(STORES.GENERATED_OUTPUTS);
  await deleteFromIndex(STORES.RESEARCH_FINDINGS);
  await deleteFromIndex(STORES.AUDIT_EVENTS);

  await promisifyTransaction(tx);
}
