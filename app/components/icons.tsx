// Iconos estilo Lucide (24x24, trazo 2px redondeado). Componentes puros,
// usables tanto en server como en client components.
import type { SVGProps } from "react";

type IconProps = { size?: number } & SVGProps<SVGSVGElement>;

function Ico({
  size = 20,
  children,
  fill = "none",
  ...rest
}: IconProps & { children?: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Icons = {
  sun: (p: IconProps) => (
    <Ico {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Ico>
  ),
  moon: (p: IconProps) => <Ico {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></Ico>,
  menu: (p: IconProps) => <Ico {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Ico>,
  x: (p: IconProps) => <Ico {...p}><path d="M18 6 6 18M6 6l12 12" /></Ico>,
  check: (p: IconProps) => <Ico {...p}><path d="M20 6 9 17l-5-5" /></Ico>,
  chevUp: (p: IconProps) => <Ico {...p}><path d="m18 15-6-6-6 6" /></Ico>,
  chevDown: (p: IconProps) => <Ico {...p}><path d="m6 9 6 6 6-6" /></Ico>,
  arrowRight: (p: IconProps) => <Ico {...p}><path d="M5 12h14M12 5l7 7-7 7" /></Ico>,
  trophy: (p: IconProps) => (
    <Ico {...p}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Ico>
  ),
  list: (p: IconProps) => <Ico {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Ico>,
  bracket: (p: IconProps) => (
    <Ico {...p}><path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" /></Ico>
  ),
  alert: (p: IconProps) => (
    <Ico {...p}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </Ico>
  ),
  circleCheck: (p: IconProps) => (
    <Ico {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </Ico>
  ),
  info: (p: IconProps) => (
    <Ico {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </Ico>
  ),
  save: (p: IconProps) => (
    <Ico {...p}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </Ico>
  ),
  star: (p: IconProps) => <Ico {...p}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" /></Ico>,
  grip: ({ size = 20, ...rest }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      stroke="none"
      {...rest}
    >
      <circle cx="9" cy="5" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="15" cy="5" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="15" cy="19" r="1.4" />
    </svg>
  ),
};
