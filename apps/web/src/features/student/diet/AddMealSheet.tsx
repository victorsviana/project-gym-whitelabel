import type { Food, IsoDate, MealSource, MealType } from '@gym/core';
import { computeFoodMacrosForQuantity, suggestMealType } from '@gym/core';
import { useState } from 'react';
import { Button, Chip, SegmentedControl, Sheet, Stepper, TextField } from '../../../ui/index.ts';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../meal-labels';
import type { ManualMacros } from './save-meal';
import { buildManualMeal, buildSearchMeal, saveMealEntry } from './save-meal';

const QUICK_QUANTITIES = [50, 100, 150, 200];

/** Resultado fixo do "reconhecimento" — simulado, rotulado como demonstração (UI-SPEC.md#registro-de-alimento). */
const AUDIO_DEMO: { name: string } & ManualMacros = {
  name: '2 ovos e 1 banana',
  kcal: 399,
  protein: 27,
  carbs: 25,
  fat: 22,
};

const METHOD_OPTIONS: readonly { value: MealSource; label: string }[] = [
  { value: 'search', label: 'Buscar' },
  { value: 'manual', label: 'Escrever' },
  { value: 'audio', label: 'Áudio' },
];

const EMPTY_MACROS: ManualMacros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

function MacroField({
  label,
  value,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-subtle text-xs font-semibold tracking-widest uppercase">{label}</p>
      <Stepper value={value} step={step} min={0} unit={unit} onChange={onChange} />
    </div>
  );
}

interface AddMealSheetProps {
  open: boolean;
  gymId: string;
  studentId: string;
  date: IsoDate;
  foodBase: readonly Food[];
  onClose: () => void;
  onAdded: () => void;
}

/** Sheet de registro de alimento (UI-SPEC.md#registro-de-alimento) — buscar, escrever ou áudio simulado. */
export function AddMealSheet({ open, gymId, studentId, date, foodBase, onClose, onAdded }: AddMealSheetProps) {
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [method, setMethod] = useState<MealSource>('search');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [name, setName] = useState('');
  const [macros, setMacros] = useState<ManualMacros>(EMPTY_MACROS);
  const [recorded, setRecorded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Reajusta o rascunho quando o sheet abre (mesmo padrão de "ajustar estado quando uma prop muda"
  // que `BrandScreen.tsx` já usa) — abrir de novo precisa recomeçar do horário atual, não do último rascunho.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const now = new Date();
      setMealType(suggestMealType(now.getHours(), now.getMinutes()));
      setMethod('search');
      setSelectedFoodId(null);
      setQuantity(100);
      setName('');
      setMacros(EMPTY_MACROS);
      setRecorded(false);
    }
  }

  if (!open) return null;

  const selectedFood = foodBase.find((food) => food.id === selectedFoodId) ?? null;
  const computedMacros = selectedFood ? computeFoodMacrosForQuantity(selectedFood, quantity) : null;

  const handleSelectFood = (food: Food) => {
    setSelectedFoodId(food.id);
    setQuantity(food.defaultQuantity);
  };

  const handleSimulateAudio = () => {
    setName(AUDIO_DEMO.name);
    setMacros({ kcal: AUDIO_DEMO.kcal, protein: AUDIO_DEMO.protein, carbs: AUDIO_DEMO.carbs, fat: AUDIO_DEMO.fat });
    setRecorded(true);
  };

  const canAdd =
    method === 'search' ? selectedFood !== null : method === 'manual' ? name.trim() !== '' : recorded && name.trim() !== '';

  const handleAdd = async () => {
    setSaving(true);
    try {
      const meal =
        method === 'search' && selectedFood
          ? buildSearchMeal(gymId, studentId, date, mealType, selectedFood, quantity)
          : buildManualMeal(gymId, studentId, date, mealType, name.trim(), macros, method === 'audio' ? 'audio' : 'manual');
      await saveMealEntry(meal);
      onAdded();
    } finally {
      setSaving(false);
    }
  };

  const mealTypeLabel = MEAL_TYPE_LABELS[mealType].toLowerCase();

  return (
    <Sheet open={open} title="Registrar alimento" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPE_ORDER.map((type) => (
            <Chip key={type} selected={mealType === type} onClick={() => setMealType(type)}>
              {MEAL_TYPE_LABELS[type]}
            </Chip>
          ))}
        </div>

        <SegmentedControl
          aria-label="Método de registro"
          options={METHOD_OPTIONS}
          value={method}
          onChange={setMethod}
        />

        {method === 'search' ? (
          <div className="flex flex-col gap-4">
            <ul className="border-border flex max-h-56 flex-col gap-1 overflow-y-auto rounded-field border">
              {foodBase.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectFood(food)}
                    className={[
                      'focus-visible:ring-brand/50 flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none',
                      selectedFoodId === food.id ? 'bg-brand/16 text-brand' : 'text-fg',
                    ].join(' ')}
                  >
                    <span>{food.name}</span>
                    <span className="text-faint text-xs">{food.kcal} kcal/100g</span>
                  </button>
                </li>
              ))}
            </ul>

            {selectedFood && computedMacros ? (
              <div className="flex flex-col gap-3">
                <Stepper value={quantity} step={10} min={10} max={2000} unit="g" onChange={setQuantity} />
                <div className="flex gap-2">
                  {QUICK_QUANTITIES.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setQuantity(amount)}
                      className={[
                        'font-display min-h-9 flex-1 cursor-pointer rounded-field border text-xs font-bold focus-visible:ring-2 focus-visible:outline-none',
                        quantity === amount
                          ? 'border-brand/25 bg-brand/16 text-brand'
                          : 'border-border bg-surface-2 text-subtle',
                      ].join(' ')}
                    >
                      {amount}g
                    </button>
                  ))}
                </div>
                <p className="text-subtle text-sm">
                  {computedMacros.kcal} kcal · P {computedMacros.protein}g · C {computedMacros.carbs}g · G{' '}
                  {computedMacros.fat}g
                </p>
              </div>
            ) : null}
          </div>
        ) : method === 'manual' ? (
          <div className="flex flex-col gap-4">
            <TextField label="Nome" value={name} onChange={(event) => setName(event.target.value)} />
            <MacroField label="Calorias" value={macros.kcal} step={10} unit="kcal" onChange={(v) => setMacros((m) => ({ ...m, kcal: v }))} />
            <MacroField label="Proteína" value={macros.protein} step={1} unit="g" onChange={(v) => setMacros((m) => ({ ...m, protein: v }))} />
            <MacroField label="Carboidrato" value={macros.carbs} step={1} unit="g" onChange={(v) => setMacros((m) => ({ ...m, carbs: v }))} />
            <MacroField label="Gordura" value={macros.fat} step={1} unit="g" onChange={(v) => setMacros((m) => ({ ...m, fat: v }))} />
          </div>
        ) : !recorded ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-subtle text-sm">Reconhecimento por áudio simulado — demonstração da Fase 1.</p>
            <Button variant="secondary" onClick={handleSimulateAudio}>
              🎙️ Simular gravação
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-faint text-xs">Resultado simulado — confira antes de adicionar.</p>
            <TextField label="Nome" value={name} onChange={(event) => setName(event.target.value)} />
            <MacroField label="Calorias" value={macros.kcal} step={10} unit="kcal" onChange={(v) => setMacros((m) => ({ ...m, kcal: v }))} />
            <MacroField label="Proteína" value={macros.protein} step={1} unit="g" onChange={(v) => setMacros((m) => ({ ...m, protein: v }))} />
            <MacroField label="Carboidrato" value={macros.carbs} step={1} unit="g" onChange={(v) => setMacros((m) => ({ ...m, carbs: v }))} />
            <MacroField label="Gordura" value={macros.fat} step={1} unit="g" onChange={(v) => setMacros((m) => ({ ...m, fat: v }))} />
          </div>
        )}

        <Button fullWidth disabled={!canAdd || saving} onClick={() => void handleAdd()}>
          {saving ? 'Adicionando…' : `Adicionar ao ${mealTypeLabel}`}
        </Button>
      </div>
    </Sheet>
  );
}
