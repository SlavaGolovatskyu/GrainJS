

export function IconMap(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}

export function IconCompass(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export function IconUsers(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconBookOpen(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function IconUser(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconStar(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={props.fill || 'none'}
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function IconChevronLeft(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function IconCheck(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconTrendingUp(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

export function IconChevronRight(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconArrowRight(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function IconShare(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  );
}

export function IconBell(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function IconSettings(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconCalendar(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function IconMapPin(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconPlus(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export function IconSearch(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconX(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function IconHeart(props) {
  const size = props.size || 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={props.fill || 'none'}
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class || props.className}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function IconLoader(props) {
  const size = props.size || 20;
  const cls = `${props.class || props.className || ''} animate-spin`.trim();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth || 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cls}
      aria-hidden="true"
      style={props.style}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
