import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmptyStorageData, SCHEMA_VERSION } from './schema';
import { loadData, saveData } from './store';

const STORAGE_KEY = 'gymapp:v1';

beforeEach(() => {
  localStorage.clear();
});

describe('loadData / saveData', () => {
  it('devolve dados vazios quando não há nada salvo', () => {
    expect(loadData()).toEqual(createEmptyStorageData());
  });

  it('faz o round-trip dos dados salvos', () => {
    const data = createEmptyStorageData();
    data.gyms.push({
      id: 'g1',
      name: 'Academia',
      slug: 'academia',
      initials: 'AC',
      logo: null,
      theme: { brand: '#000000', brandFg: '#ffffff', mode: 'dark' },
      createdAt: new Date().toISOString(),
    });

    saveData(data);

    expect(loadData().gyms).toHaveLength(1);
    expect(loadData().gyms[0].id).toBe('g1');
  });

  it('grava a versão atual do schema no envelope', () => {
    saveData(createEmptyStorageData());
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.version).toBe(SCHEMA_VERSION);
  });

  it('avisa e preserva os dados quando a versão salva é mais nova que a do código', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION + 1,
        updatedAt: new Date().toISOString(),
        data: createEmptyStorageData(),
      }),
    );

    const data = loadData();

    expect(warn).toHaveBeenCalledOnce();
    expect(data).toEqual(createEmptyStorageData());

    warn.mockRestore();
  });
});
