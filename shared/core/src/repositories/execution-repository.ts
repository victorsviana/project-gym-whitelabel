import type { IsoDate } from '../dates';
import type { LoadLog, SetLog } from '../types';

/** Séries marcadas e cargas registradas. */
export interface ExecutionRepository {
  listSetLogs(gymId: string, studentId: string, planId: string, date: IsoDate): Promise<SetLog[]>;
  /** Marca a série concluída; idempotente por `id`. */
  markSetLog(log: SetLog): Promise<void>;
  /** Desmarca uma série concluída. */
  removeSetLog(gymId: string, setLogId: string): Promise<void>;

  /** Histórico ordenado por data crescente. */
  listLoadLogs(
    gymId: string,
    studentId: string,
    planId: string,
    exerciseId: string,
  ): Promise<LoadLog[]>;
  /** Upsert pela chave lógica `studentId + planId + exerciseId + date` — registrar de novo no mesmo dia sobrescreve. */
  saveLoadLog(log: LoadLog): Promise<void>;
}
