import { createComponent } from '../../../../index.js';

export const IconMap = createComponent(function IconMap(props) {
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
});

export const IconCompass = createComponent(function IconCompass(props) {
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
});

export const IconUsers = createComponent(function IconUsers(props) {
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
});

export const IconBookOpen = createComponent(function IconBookOpen(props) {
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
});

export const IconUser = createComponent(function IconUser(props) {
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
});

export const IconStar = createComponent(function IconStar(props) {
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
});

export const IconChevronRight = createComponent(function IconChevronRight(props) {
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
});

export const IconArrowRight = createComponent(function IconArrowRight(props) {
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
});

export const IconShare = createComponent(function IconShare(props) {
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
});
