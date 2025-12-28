import { idbDel, idbGet, idbSet } from './idb-kv';

const KEY = 'landing-workflow-v1';

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
  if (!payload || payload.version !== 1) return null;

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


