import { migrate } from './migrations';
import { createEmptyStorageData, SCHEMA_VERSION, type StorageData, type StorageEnvelope } from './schema';

const STORAGE_KEY = 'gymapp:v1';

/**
 * Lê o envelope de `localStorage`, migrando dados antigos e avisando (sem apagar nada)
 * quando o dado salvo é de uma versão mais nova que a do código.
 */
export function loadData(): StorageData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyStorageData();

  const envelope = JSON.parse(raw) as StorageEnvelope;

  if (envelope.version > SCHEMA_VERSION) {
    console.warn(
      `gymapp: dados salvos na versão ${envelope.version}, mais nova que a do app (${SCHEMA_VERSION}). Restaure os dados de demonstração.`,
    );
    return envelope.data;
  }

  return migrate(envelope.data, envelope.version);
}

export function saveData(data: StorageData): void {
  const envelope: StorageEnvelope = {
    version: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    data,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}
