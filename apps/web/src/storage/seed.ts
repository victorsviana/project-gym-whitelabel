import { buildSeedData } from './seed/build';
import { loadData, saveData } from './store';

/**
 * Garante as três academias de demonstração de SEED-DATA.md (Gaviões Fitness, Bluefit, Iron
 * House — professor, alunos, planos, atribuições e histórico) na primeira execução. Idempotente:
 * só semeia se ainda não houver nenhuma academia salva.
 */
export async function seedIfEmpty(): Promise<void> {
  const { gyms } = loadData();
  if (gyms.length > 0) return;
  saveData(buildSeedData());
}

/**
 * Ação de "restaurar dados de demonstração": descarta o que estiver salvo e recria as três
 * academias do zero. `saveData` substitui o envelope inteiro, então basta gravar um dataset novo.
 */
export async function restoreDemoData(): Promise<void> {
  saveData(buildSeedData());
}
