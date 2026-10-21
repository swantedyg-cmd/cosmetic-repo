// Monoline 1.5px icons, drawn on a 24px grid.

type IconProps = { className?: string };

function Icon({ children, className = "h-5 w-5" }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Icon>
);
export const UserIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></Icon>
);
export const BagIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 8h14l-1 12.5H6z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></Icon>
);
export const LeafIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" /><path d="M5 19 13 11" /></Icon>
);
export const RabbitIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 10C7.5 6 7.5 3 9 3s2.5 3 2.5 6.5M13 9.5C13 6 14 3 15.5 3S16.5 6 15 10" />
    <path d="M6.5 16a5.5 5 0 0 1 11 0c0 2.5-2.5 4-5.5 4s-5.5-1.5-5.5-4z" />
    <circle cx="10" cy="15" r=".5" /><circle cx="14" cy="15" r=".5" />
  </Icon>
);
export const DropIcon = (p: IconProps) => (
  <Icon {...p}><path d="M12 3.5c3.5 4.5 6 7.8 6 11a6 6 0 0 1-12 0c0-3.2 2.5-6.5 6-11z" /></Icon>
);
export const RecycleIcon = (p: IconProps) => (
  <Icon {...p}><path d="M7 9.5 9.5 5h5l2.5 4.5M17 9.5l2 4-2.5 4.5H12M12 18H7l-2.5-4.5L7 9.5" /><path d="m5 7 2 2.5L9.5 8M14 20l-2-2 2-2M19 11.5l-2-2" /></Icon>
);
export const HeartIcon = (p: IconProps) => (
  <Icon {...p}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" /></Icon>
);
export const CloseIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 5l14 14M19 5 5 19" /></Icon>
);
