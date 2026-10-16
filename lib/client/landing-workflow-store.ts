import { idbDel, idbGet, idbSet } from './idb-kv';

// Bump the version suffix (and the `version` field) if the stored shape changes.
const KEY = 'landing-workflow-v1';

// File contents are kept as raw bytes because `File` objects can't be persisted to IndexedDB directly.
type StoredWorkflowFile = {
  name: string;
  type: string;
  lastModified: number;
  bytes: ArrayBuffer;
};

type StoredLandingWorkflow = {
  version: 1;
  savedAt: number;
  targetLanguage: string | null;
  files: StoredWorkflowFile[];
};

export async function saveLandingWorkflow(input: {
  files: File[];
  targetLanguage: string | null;
}) {
  const storedFiles: StoredWorkflowFile[] = await Promise.all(
    input.files.map(async (file) => ({
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      bytes: await file.arrayBuffer(),
    })),
  );

  const payload: StoredLandingWorkflow = {
    version: 1,
    savedAt: Date.now(),
    targetLanguage: input.targetLanguage,
    files: storedFiles,
  };

  await idbSet(KEY, payload);
}

export async function loadLandingWorkflow(): Promise<{
  savedAt: number;
  targetLanguage: string | null;
  files: File[];
} | null> {
  const payload = await idbGet<StoredLandingWorkflow>(KEY);
  // Ignore missing or incompatible payloads instead of trying to migrate them.
  if (!payload || payload.version !== 1) return null;

  // Rebuild real File objects from the stored bytes.
  const files = payload.files.map(
    (f) =>
      new File([f.bytes], f.name, {
        type: f.type,
        lastModified: f.lastModified,
      }),
  );

  return {
    savedAt: payload.savedAt,
    targetLanguage: payload.targetLanguage,
    files,
  };
}

export async function clearLandingWorkflow() {
  await idbDel(KEY);
}


