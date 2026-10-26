import { GeneratedOutput, OutputType, AnalysisVersion } from '../types';
import { openDatabase, STORES } from './db';
import { promisifyRequest, promisifyTransaction } from './projectRepository';

export interface SaveOutputOptions {
  allowDraftWithoutApprovedAnalysis?: boolean;
}

/**
 * Save a generated output version
 * Enforces:
 * 1. Must reference analysis_version_id and master_rules_version_id (Constraint 130).
 * 2. Downstream outputs cannot run against unapproved analysis versions (Rule 13).
 * 3. Historical version preservation (never silently overwrites).
 */
export async function saveOutput(
  output: GeneratedOutput,
  options: SaveOutputOptions = {},
  customDb?: IDBDatabase
): Promise<GeneratedOutput> {
  const db = customDb || await openDatabase();
  const tx = db.transaction([STORES.GENERATED_OUTPUTS, STORES.ANALYSIS_VERSIONS, STORES.PROJECTS], 'readwrite');
  const outputStore = tx.objectStore(STORES.GENERATED_OUTPUTS);
  const analysisStore = tx.objectStore(STORES.ANALYSIS_VERSIONS);
  const projectStore = tx.objectStore(STORES.PROJECTS);

  // 1. Verify project exists
  const project = await promisifyRequest(projectStore.get(output.project_id));
  if (!project) {
    throw new Error(`Project ${output.project_id} not found`);
  }

  // 2. Verify referenced analysis exists
  const analysis = await promisifyRequest(
    analysisStore.get(output.analysis_version_id)
  ) as AnalysisVersion | undefined;
  if (!analysis) {
    throw new Error(`Referenced AnalysisVersion ${output.analysis_version_id} does not exist`);
  }

  // 3. Rule 13: Analysis must be approved
  if (analysis.review_status !== 'approved' && !options.allowDraftWithoutApprovedAnalysis) {
    throw new Error(`Cannot save downstream output for unapproved analysis version (${analysis.analysis_version_id})`);
  }

  // 4. If this output supersedes a previous output, update previous to 'superseded'
  if (output.supersedes_output_id) {
    const prevOutput = await promisifyRequest(
      outputStore.get(output.supersedes_output_id)
    ) as GeneratedOutput | undefined;
    if (prevOutput) {
      await promisifyRequest(
        outputStore.put({
          ...prevOutput,
          status: 'superseded',
        })
      );
    }
  }

  // 5. Save the output
  await promisifyRequest(outputStore.put(output));
  await promisifyTransaction(tx);
  return output;
}

/**
 * List outputs for a project, optionally filtered by OutputType
 */
export async function listOutputsForProject(
  projectId: string,
  outputType?: OutputType,
  customDb?: IDBDatabase
): Promise<GeneratedOutput[]> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(STORES.GENERATED_OUTPUTS, 'readonly');
  const store = tx.objectStore(STORES.GENERATED_OUTPUTS);
  const index = store.index('project_id');
  const allOutputs = await promisifyRequest(index.getAll(projectId)) as GeneratedOutput[];

  const filtered = outputType ? allOutputs.filter((o) => o.output_type === outputType) : allOutputs;
  return filtered.sort((a, b) => a.version_number - b.version_number);
}

/**
 * Retrieve a specific output by ID
 */
export async function getOutput(outputId: string, customDb?: IDBDatabase): Promise<GeneratedOutput | null> {
  const db = customDb || await openDatabase();
  const tx = db.transaction(STORES.GENERATED_OUTPUTS, 'readonly');
  const store = tx.objectStore(STORES.GENERATED_OUTPUTS);
  const output = await promisifyRequest(store.get(outputId)) as GeneratedOutput | undefined;
  return output || null;
}
