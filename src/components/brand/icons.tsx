import type { SVGProps } from 'react';

/* ==========================================================================
   Jeu d'icônes
   Un seul style, sans exception : grille 24, trait 1.6, extrémités et
   jonctions arrondies. L'arrondi n'est pas décoratif — c'est ce qui raccorde
   les pictogrammes aux lettres du logo et aux rayons de l'interface.
   ========================================================================== */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconSprout = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21v-8" />
    <path d="M12 13c0-3.9 2.7-6.6 6.5-7-.2 4-2.6 6.7-6.5 7Z" />
    <path d="M12 16c-3.3 0-5.6-2.3-5.8-5.7 3.3.3 5.5 2.5 5.8 5.7Z" />
  </Icon>
);

export const IconGraduation = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Z" />
    <path d="M6.5 11v4.6c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9V11" />
    <path d="M21.5 9v5" />
  </Icon>
);

export const IconTeacher = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M4.6 20c.6-3.7 3.7-6 7.4-6s6.8 2.3 7.4 6" />
  </Icon>
);

export const IconIdea = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.4 17.5a5.8 5.8 0 1 1 5.2 0" />
    <path d="M9.7 20.5h4.6" />
    <path d="M12 2.5v1.2M4.6 6.4l.9.8M19.4 6.4l-.9.8" />
  </Icon>
);

export const IconBriefcase = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="7.5" width="18" height="12" rx="3" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
    <path d="M3 12.5h18" />
  </Icon>
);

export const IconFlask = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3.5h4" />
    <path d="M10.8 3.5v5.2L5.6 17.3c-.9 1.5.2 3.2 2 3.2h8.8c1.8 0 2.9-1.7 2-3.2l-5.2-8.6V3.5" />
    <path d="M7.6 14.5h8.8" />
  </Icon>
);

export const IconHandshake = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.8 12.4 7 8.2l3 1.6 2-1.2 2 1.2 3-1.6 4.2 4.2" />
    <path d="m9.2 14.6 2 2 2-2 2 2" />
    <path d="M6.4 16.4 8.8 19c.7.7 1.8.7 2.5 0" />
    <path d="m17.6 16.4-2.4 2.6c-.7.7-1.8.7-2.5 0" />
  </Icon>
);

export const IconGlobe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M3.2 12h17.6" />
    <path d="M12 3.2c2.2 2.4 3.4 5.5 3.4 8.8S14.2 18.4 12 20.8C9.8 18.4 8.6 15.3 8.6 12S9.8 5.6 12 3.2Z" />
  </Icon>
);

export const IconBuilding = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20.5V6.2a1.6 1.6 0 0 1 1.1-1.5l6-2a1.6 1.6 0 0 1 2.1 1.5v16.3" />
    <path d="M13.2 9.5h5.2a1.6 1.6 0 0 1 1.6 1.6v9.4" />
    <path d="M2.6 20.5h18.8M7.4 8.6h2.4M7.4 12.4h2.4M7.4 16.2h2.4" />
  </Icon>
);

export const IconUsers = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9.2" cy="8.4" r="3.2" />
    <path d="M3 19.4c.5-3.2 3.1-5.2 6.2-5.2s5.7 2 6.2 5.2" />
    <path d="M16 5.6a3.2 3.2 0 0 1 0 5.6M17.6 14.6c2 .7 3.3 2.4 3.6 4.8" />
  </Icon>
);

export const IconCalendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.2" y="5" width="17.6" height="16" rx="3.2" />
    <path d="M3.2 10h17.6M8.4 3v4M15.6 3v4" />
  </Icon>
);

export const IconPin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21.2s7-5.4 7-10.4a7 7 0 1 0-14 0c0 5 7 10.4 7 10.4Z" />
    <circle cx="12" cy="10.6" r="2.6" />
  </Icon>
);

export const IconPhone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.2 3.6h3l1.5 3.8-2 1.4a11.4 11.4 0 0 0 5.5 5.5l1.4-2 3.8 1.5v3a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 4.2 5.8a2 2 0 0 1 2-2.2Z" />
  </Icon>
);

export const IconMail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="3.2" />
    <path d="m3.6 8 7.3 4.7c.7.4 1.5.4 2.2 0L20.4 8" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.8" cy="10.8" r="6.8" />
    <path d="m15.8 15.8 4.4 4.4" />
  </Icon>
);

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Icon>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7M8.4 7H17v8.6" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
  </Icon>
);

export const IconMenu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h11" />
  </Icon>
);

export const IconPoints = (p: IconProps) => (
  <Icon {...p} strokeWidth={0} fill="currentColor">
    <circle cx="5" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="19" cy="12" r="1.7" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4.8 12.6 4.6 4.6 9.8-10" />
  </Icon>
);

export const IconInfo = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 11v5.4M12 7.8v.2" />
  </Icon>
);

export const IconDownload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.6v11M7.6 10.4 12 14.8l4.4-4.4" />
    <path d="M4.4 16.4v1.8a2.2 2.2 0 0 0 2.2 2.2h10.8a2.2 2.2 0 0 0 2.2-2.2v-1.8" />
  </Icon>
);

export const IconFile = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.4 3H7.6a2.4 2.4 0 0 0-2.4 2.4v13.2A2.4 2.4 0 0 0 7.6 21h8.8a2.4 2.4 0 0 0 2.4-2.4V8.2Z" />
    <path d="M13.4 3v5.2h5.4M8.8 13h6.4M8.8 16.6h4.4" />
  </Icon>
);

export const IconBell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 9.4a6 6 0 1 0-12 0c0 3.2-.7 5-1.6 6.1-.4.5 0 1.2.6 1.2h14c.6 0 1-.7.6-1.2-.9-1.1-1.6-2.9-1.6-6.1Z" />
    <path d="M10 19.4a2.2 2.2 0 0 0 4 0" />
  </Icon>
);

export const IconClock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 6.8V12l3.4 2" />
  </Icon>
);

export const IconQuote = (p: IconProps) => (
  <Icon {...p} strokeWidth={0} fill="currentColor">
    <path d="M9.6 5.6c-3.4 1.3-5.6 4.3-5.6 8.2 0 2.8 1.7 4.6 4 4.6 2.1 0 3.7-1.5 3.7-3.6 0-2-1.4-3.4-3.3-3.4-.4 0-.8 0-1 .2.5-1.9 1.9-3.4 3.7-4.2Zm9.4 0c-3.4 1.3-5.6 4.3-5.6 8.2 0 2.8 1.7 4.6 4 4.6 2.1 0 3.7-1.5 3.7-3.6 0-2-1.4-3.4-3.3-3.4-.4 0-.8 0-1 .2.5-1.9 1.9-3.4 3.7-4.2Z" />
  </Icon>
);

export const IconTarget = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </Icon>
);

export const IconShield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.2 5 6v6.2c0 4 2.9 7.3 7 8.6 4.1-1.3 7-4.6 7-8.6V6Z" />
    <path d="m9.2 12.2 2 2 3.6-3.8" />
  </Icon>
);

export const IconDrone = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="6" height="6" rx="2" />
    <path d="M9.6 9.6 6.4 6.4M14.4 9.6l3.2-3.2M9.6 14.4l-3.2 3.2M14.4 14.4l3.2 3.2" />
    <circle cx="5.2" cy="5.2" r="2.2" />
    <circle cx="18.8" cy="5.2" r="2.2" />
    <circle cx="5.2" cy="18.8" r="2.2" />
    <circle cx="18.8" cy="18.8" r="2.2" />
  </Icon>
);

export const IconLeafPair = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 19.5C4.5 11 9.5 5.5 19.5 4.5c1 10-4.5 15-13 15Z" />
    <path d="M4.5 19.5c3-3 6-5.4 9.5-7.5" />
  </Icon>
);
