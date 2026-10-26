import { Source } from '../types';
import { openDatabase, STORES } from './db';
import { promisifyRequest, promisifyTransaction } from './projectRepository';

/**
 * Save or update a source record (strictly isolated by project_id)
 */
export async function saveSource(source: Source, customDb?: IDBDatabase): Promise<Source> {
  const db = customDb || await openDatabase();
  const tx = db.transaction([STORES.SOURCES, STORES.PROJECTS], 'readwrite');
  const sourceStore = tx.objectStore(STORES.SOURCES);
  const projectStore = tx.objectStore(STORES.PROJECTS);

  // Verify project exists
  const project = await promisifyRequest(projectStore.get(source.project_id));
  if (!project) {
    throw new Error(`Project ${source.project_id} does not exist`);
  }

  // Ensure provenance text contains no clickable HTML anchors
  const sanitizedSource: Source = {
    ...source,
    non_clickable_provenance_text: source.non_clickable_provenance_text.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1'),
  };

  await promisifyRequest(sourceStore.put(sanitizedSource));
  await promisifyTransaction(tx);
  return sanitizedSource;
}

/**
 * List all sources for a specific project
 */
export async function listSourcesForProject(projectId: string, customDb?: IDBDatabase): Promise<Source[]> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(STORES.SOURCES, 'readonly');
  const store = tx.objectStore(STORES.SOURCES);
  const index = store.index('project_id');
  const sources = await promisifyRequest(index.getAll(projectId)) as Source[];
  return sources.sort((a, b) => a.source_version - b.source_version);
}

/**
 * Get a specific source by its unique ID
 */
export async function getSource(sourceId: string, customDb?: IDBDatabase): Promise<Source | null> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(STORES.SOURCES, 'readonly');
  const store = tx.objectStore(STORES.SOURCES);
  const source = await promisifyRequest(store.get(sourceId)) as Source | undefined;
  return source || null;
}
