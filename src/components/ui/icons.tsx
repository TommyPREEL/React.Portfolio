/**
 * @fileoverview In-house SVG icon set.
 * 24 px grid, 1.5 px stroke, square caps, currentColor. No third-party icon pack.
 */

import type { ReactNode, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

function Icon({ size = 24, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 5l14 14M19 5L5 19" /></Icon>
);

export const GearIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3h4l.7 2.6 2 1.2 2.6-.8 2 3.4-1.9 1.9v2.4l1.9 1.9-2 3.4-2.6-.8-2 1.2L14 21h-4l-.7-2.6-2-1.2-2.6.8-2-3.4 1.9-1.9v-2.4L2.7 8.4l2-3.4 2.6.8 2-1.2z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const BoostIcon = (p: IconProps) => (
  <Icon {...p}><path d="M13 3L5 13.5h6L10 21l9-11h-6z" /></Icon>
);

export const MapPinIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21l-5.5-8.2a6.5 6.5 0 1 1 11 0z" />
    <circle cx="12" cy="9.5" r="2.2" />
  </Icon>
);

export const GarageIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 10l9-6 9 6v10H3z" />
    <path d="M7 20v-7h10v7M7 16.5h10" />
  </Icon>
);

export const ArcadeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 3h10v18H7zM5 21h14" />
    <path d="M9.5 6h5v5h-5zM9.5 15h2M14 15h.5" />
  </Icon>
);

export const BlocksIcon = (p: IconProps) => (
  <Icon {...p}><path d="M3 14h8v7H3zM13 14h8v7h-8zM8 6h8v7H8z" /></Icon>
);

export const AntennaIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 12v9M8.5 21h7" />
    <circle cx="12" cy="9" r="1.5" />
    <path d="M8.5 5.5a5 5 0 0 0 0 7M15.5 5.5a5 5 0 0 1 0 7M5.5 3a9 9 0 0 0 0 12M18.5 3a9 9 0 0 1 0 12" />
  </Icon>
);

export const SoundOnIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Icon>
);

export const SoundOffIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Icon>
);

export const ExternalLinkIcon = (p: IconProps) => (
  <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /></Icon>
);

export const ArrowIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Icon>
);

const ZONE_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  about: GarageIcon,
  projects: ArcadeIcon,
  skills: BlocksIcon,
  contact: AntennaIcon,
};

/** Icon for a world zone id (about, projects, skills, contact). Falls back to a map pin. */
export function ZoneIcon({ id, ...rest }: IconProps & { id: string }) {
  const Component = ZONE_ICONS[id] ?? MapPinIcon;
  return <>{Component(rest)}</>;
}
