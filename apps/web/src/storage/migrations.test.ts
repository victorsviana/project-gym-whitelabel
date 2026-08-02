import { describe, expect, it } from 'vitest';
import { migrate, type MigrationStep } from './migrations';
import { createEmptyStorageData } from './schema';

describe('migrate', () => {
  it('não altera os dados quando já está na versão atual', () => {
    const data = createEmptyStorageData();
    expect(migrate(data, 1, {}, 1)).toBe(data);
  });

  it('aplica uma única migração ao subir uma versão', () => {
    const data = { ...createEmptyStorageData(), foods: [] };
    const addPlaceholderFood: MigrationStep = (d) => ({
      ...d,
      foods: [
        { id: 'seed', gymId: null, name: 'Arroz', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, defaultQuantity: 100 },
      ],
    });

    const migrated = migrate(data, 1, { 1: addPlaceholderFood }, 2);

    expect(migrated.foods).toHaveLength(1);
    expect(migrated.foods[0].name).toBe('Arroz');
  });

  it('aplica migrações em ordem, uma por versão intermediária', () => {
    const data = { ...createEmptyStorageData(), notices: [] };
    const order: number[] = [];
    const migrations: Record<number, MigrationStep> = {
      1: (d) => {
        order.push(1);
        return d;
      },
      2: (d) => {
        order.push(2);
        return d;
      },
    };

    migrate(data, 1, migrations, 3);

    expect(order).toEqual([1, 2]);
  });

  it('pula versões sem migração registrada', () => {
    const data = createEmptyStorageData();
    expect(() => migrate(data, 1, {}, 5)).not.toThrow();
    expect(migrate(data, 1, {}, 5)).toEqual(data);
  });
});
