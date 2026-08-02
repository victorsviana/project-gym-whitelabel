import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ProgressBar,
  Ring,
  SegmentedControl,
  Sheet,
  Stepper,
  Toast,
  Toggle,
} from '../ui/index.ts';

type Theme = 'dark' | 'light';

interface DemoBrand {
  name: string;
  brand: string;
  brandRgb: string;
  brandFg: string;
}

const DEMO_BRANDS: readonly DemoBrand[] = [
  { name: 'Gaviões Fitness', brand: '#E4022E', brandRgb: '228 2 46', brandFg: '#FFFFFF' },
  { name: 'Bluefit', brand: '#2E7BFF', brandRgb: '46 123 255', brandFg: '#FFFFFF' },
  { name: 'Iron House', brand: '#FF6B2C', brandRgb: '255 107 44', brandFg: '#0A0B0A' },
];

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
] as const;

const MUSCLE_GROUPS = ['Peito', 'Costas', 'Pernas', 'Ombro', 'Braço'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-fg text-2xl font-extrabold tracking-wide uppercase">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export function Showcase() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [brandIndex, setBrandIndex] = useState(0);
  const [load, setLoad] = useState(72.5);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number]['value']>('week');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Peito', 'Pernas']);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const demo = DEMO_BRANDS[brandIndex];
    const root = document.documentElement.style;
    root.setProperty('--brand', demo.brand);
    root.setProperty('--brand-rgb', demo.brandRgb);
    root.setProperty('--brand-fg', demo.brandFg);
  }, [brandIndex]);

  const toggleGroup = (group: string) => {
    setSelectedGroups((current) =>
      current.includes(group) ? current.filter((item) => item !== group) : [...current, group],
    );
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-8">
      <header className="flex flex-col gap-4">
        <div>
          <p className="text-brand font-display text-sm font-bold tracking-widest uppercase">
            Design system · F1-E02
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-wide uppercase">
            Componentes base
          </h1>
          <p className="text-subtle mt-1 text-sm">
            Tokens ligados a CSS vars ({/* ver docs/decisions/ADR-0003 */}
            <code>--brand</code>, <code>--bg</code>, <code>--fg</code>…). Troque marca e tema abaixo
            para confirmar que o app inteiro repinta sem rebuild.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={[
              { value: 'dark', label: 'Escuro' },
              { value: 'light', label: 'Claro' },
            ]}
            value={theme}
            onChange={setTheme}
            aria-label="Tema"
          />
          <div className="flex gap-2">
            {DEMO_BRANDS.map((demo, index) => (
              <Chip
                key={demo.name}
                selected={index === brandIndex}
                onClick={() => setBrandIndex(index)}
              >
                {demo.name}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <Section title="Button">
        <Card className="flex flex-col items-start gap-3">
          <Button variant="primary">Iniciar treino</Button>
          <Button variant="secondary">Ver histórico</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary" disabled>
            Indisponível
          </Button>
        </Card>
      </Section>

      <Section title="Card">
        <Card>
          <p className="font-display text-lg font-bold uppercase">Cartão padrão</p>
          <p className="text-subtle text-sm">bg-surface, borda sutil.</p>
        </Card>
        <Card elevated>
          <p className="font-display text-lg font-bold uppercase">Cartão elevado</p>
          <p className="text-subtle text-sm">bg-surface-2, para destacar sobre outro cartão.</p>
        </Card>
        <Card highlight elevated className="border-brand/25">
          <p className="font-display text-lg font-bold uppercase">Cartão de destaque</p>
          <p className="text-subtle text-sm">radius maior, borda tingida de marca.</p>
        </Card>
      </Section>

      <Section title="Chip">
        <Card className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((group) => (
            <Chip
              key={group}
              selected={selectedGroups.includes(group)}
              onClick={() => toggleGroup(group)}
            >
              {group}
            </Chip>
          ))}
        </Card>
      </Section>

      <Section title="Stepper">
        <Card>
          <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
            Carga (±2,5 kg)
          </p>
          <Stepper value={load} step={2.5} min={0} unit="kg" onChange={setLoad} />
        </Card>
      </Section>

      <Section title="Toggle">
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold">Notificações de treino</span>
          <Toggle
            checked={notificationsOn}
            onChange={setNotificationsOn}
            label="Notificações de treino"
          />
        </Card>
      </Section>

      <Section title="SegmentedControl">
        <Card>
          <SegmentedControl
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
            aria-label="Período"
          />
        </Card>
      </Section>

      <Section title="ProgressBar">
        <Card className="flex flex-col gap-3">
          <ProgressBar value={62} color="protein" label="Proteína" />
          <ProgressBar value={40} color="carbs" label="Carboidrato" />
          <ProgressBar value={25} color="fat" label="Gordura" />
          <ProgressBar value={80} color="water" label="Hidratação" />
        </Card>
      </Section>

      <Section title="Ring">
        <Card className="flex items-center justify-center">
          <Ring value={1840} max={2400} color="var(--brand)">
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold tabular-nums">1.840</p>
              <p className="text-faint text-xs uppercase">kcal</p>
            </div>
          </Ring>
        </Card>
      </Section>

      <Section title="EmptyState">
        <Card>
          <EmptyState
            title="Nenhum treino hoje"
            description="Seu professor ainda não atribuiu um plano para essa data."
            action={<Button size="sm">Ver planos</Button>}
          />
        </Card>
      </Section>

      <Section title="Sheet">
        <Card className="flex flex-col items-start gap-3">
          <Button onClick={() => setSheetOpen(true)}>Registrar carga</Button>
          <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Registrar carga">
            <p className="text-subtle mb-4 text-sm">Supino reto — série 3</p>
            <Stepper value={load} step={2.5} min={0} unit="kg" onChange={setLoad} />
            <Button fullWidth className="mt-4" onClick={() => setSheetOpen(false)}>
              Salvar
            </Button>
          </Sheet>
        </Card>
      </Section>

      <Section title="Toast">
        <Card className="flex flex-col items-start gap-3">
          <Button variant="secondary" onClick={() => setToastVisible(true)}>
            Mostrar toast
          </Button>
          {toastVisible ? (
            <Toast
              message="Carga registrada"
              variant="success"
              onDismiss={() => setToastVisible(false)}
            />
          ) : null}
        </Card>
      </Section>
    </div>
  );
}
