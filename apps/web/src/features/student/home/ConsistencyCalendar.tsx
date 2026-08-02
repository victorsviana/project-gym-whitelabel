import type { IsoDate } from '@gym/core';
import { parseIsoDate } from '@gym/core';

interface ConsistencyCalendarProps {
  today: IsoDate;
  activeDates: ReadonlySet<IsoDate>;
  onSelectDay: (date: IsoDate) => void;
}

const WEEKDAY_HEADERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Calendário do mês corrente, dias ativos destacados na cor da marca, hoje contornado. */
export function ConsistencyCalendar({ today, activeDates, onSelectDay }: ConsistencyCalendarProps) {
  const { year, month, day: todayDay } = parseIsoDate(today);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const cells: { date: IsoDate; day: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${year}-${pad(month)}-${pad(d)}`, day: d });
  }

  return (
    <div>
      <div className="text-faint mb-2 grid grid-cols-7 text-center text-xs font-semibold">
        {WEEKDAY_HEADERS.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, index) => (
          <span key={`blank-${index}`} aria-hidden="true" />
        ))}
        {cells.map(({ date, day }) => {
          const isActive = activeDates.has(date);
          const isToday = day === todayDay;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDay(date)}
              aria-label={`Dia ${day}${isActive ? ', ativo' : ''}${isToday ? ', hoje' : ''}`}
              className={[
                'focus-visible:ring-brand/50 flex aspect-square cursor-pointer items-center justify-center rounded-icon text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none',
                isActive
                  ? 'bg-brand text-brand-fg font-extrabold'
                  : isToday
                    ? 'border-brand text-brand border'
                    : 'bg-surface-2 text-subtle',
              ].join(' ')}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
