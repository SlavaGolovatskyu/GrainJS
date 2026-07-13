import { createComponent } from '../../../../../index.js';
import { cn } from '../utils/cn.js';

export const Label = createComponent(function Label(props) {
  return (
    <label
      for={props.for || props.htmlFor}
      class={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class || props.className
      )}
    >
      {props.children}
    </label>
  );
});

export const Badge = createComponent(function Badge(props) {
  return (
    <div
      class={cn(
        'inline-flex items-center rounded-full border border-transparent bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground',
        props.class || props.className
      )}
    >
      {props.children}
    </div>
  );
});

export const Skeleton = createComponent(function Skeleton(props) {
  return (
    <div
      class={cn(
        'animate-pulse rounded-md bg-muted',
        props.class || props.className
      )}
    />
  );
});

export const Separator = createComponent(function Separator(props) {
  return (
    <div
      role="separator"
      class={cn('shrink-0 bg-border h-[1px] w-full', props.class || props.className)}
    />
  );
});
