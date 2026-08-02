import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      {icon ? (
        <div className="text-faint" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-lg font-extrabold tracking-wide uppercase">{title}</p>
      {description ? <p className="text-subtle max-w-xs text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
