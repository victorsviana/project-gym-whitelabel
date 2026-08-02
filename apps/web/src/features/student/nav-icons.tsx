interface NavIconProps {
  className?: string;
}

/** Ícones da `BottomNav` — mesmos paths de `prototype/extracted/logic.js` (tabDef). */
function NavIcon({ path, className }: { path: string } & NavIconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export function HomeIcon(props: NavIconProps) {
  return <NavIcon path="M3 11l9-8 9 8M5 10v10h14V10" {...props} />;
}

export function WorkoutIcon(props: NavIconProps) {
  return <NavIcon path="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" {...props} />;
}

export function DietIcon(props: NavIconProps) {
  return <NavIcon path="M12 21s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.5-7 10-7 10z" {...props} />;
}

export function ProfileIcon(props: NavIconProps) {
  return <NavIcon path="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6" {...props} />;
}
