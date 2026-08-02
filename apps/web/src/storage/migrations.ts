import { SCHEMA_VERSION, type StorageData } from './schema';

export type MigrationStep = (data: StorageData) => StorageData;

/**
 * Uma migração por versão, indexada pela versão de origem.
 * Ex.: `{ 1: (data) => ({ ...data, foods: data.foods.map(...) }) }` migra de v1 para v2.
 * Vazio até a primeira mudança de schema depois da v1.
 */
const MIGRATIONS: Record<number, MigrationStep> = {};

/**
 * Aplica em ordem as migrações entre `fromVersion` e `toVersion`. Pura e testável —
 * `migrations`/`toVersion` só existem como parâmetro para o teste poder injetar um cenário
 * sem esperar a próxima mudança real de schema.
 */
export function migrate(
  data: StorageData,
  fromVersion: number,
  migrations: Record<number, MigrationStep> = MIGRATIONS,
  toVersion: number = SCHEMA_VERSION,
): StorageData {
  let result = data;
  for (let version = fromVersion; version < toVersion; version += 1) {
    const step = migrations[version];
    if (step) result = step(result);
  }
  return result;
}
