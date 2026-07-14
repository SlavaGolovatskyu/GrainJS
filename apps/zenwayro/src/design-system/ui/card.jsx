
import { cn } from '../utils/cn.js';

export function Card(props) {
  const outlet = props.children;
  return (
    <div
      class={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow',
        props.class || props.className
      )}
    >
      {outlet}
    </div>
  );
}

export function CardHeader(props) {
  const outlet = props.children;
  return (
    <div class={cn('flex flex-col space-y-1.5 p-6', props.class || props.className)}>
      {outlet}
    </div>
  );
}

export function CardTitle(props) {
  const text = props.children;
  return (
    <h3
      class={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        props.class || props.className
      )}
    >
      {text}
    </h3>
  );
}

export function CardContent(props) {
  const outlet = props.children;
  return (
    <div class={cn('p-6 pt-0', props.class || props.className)}>{outlet}</div>
  );
}
