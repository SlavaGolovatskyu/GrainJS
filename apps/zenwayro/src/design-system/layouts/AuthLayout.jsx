import { Link } from 'grainlet/route';
import { cn } from '../utils/cn.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { t } from '../../i18n/t.js';
import {
  ROUTE_CONTACT,
  ROUTE_COOKIES,
  ROUTE_PRIVACY,
  ROUTE_TERMS,
} from '../../constants/routes.js';

export function RouteV2Wrapper(props) {
  const outlet = props.children;
  const width =
    props.width === 'narrow'
      ? 'max-w-sm'
      : props.width === 'wide'
        ? 'max-w-6xl'
        : 'max-w-4xl';
  return (
    <div
      class={cn(
        'zenwayro-v2-ui mx-auto w-full px-4',
        width,
        props.class || props.className
      )}
    >
      {outlet}
    </div>
  );
}

export function AuthPageLayout(props) {
  const outlet = props.children;
  const title = props.title;
  const description = props.description;
  return (
    <RouteV2Wrapper
      width="narrow"
      class="flex min-h-full items-center justify-center py-16"
    >
      <Card class="w-full max-w-sm border-border shadow-lg">
        <CardHeader class="space-y-1 text-center">
          <CardTitle class="text-2xl font-bold">{title}</CardTitle>
          {description ? (
            <p class="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </CardHeader>
        <CardContent class="space-y-4">{outlet}</CardContent>
      </Card>
    </RouteV2Wrapper>
  );
}

export function AppFooter(props) {
  const year = String(new Date().getFullYear());
  return (
    <footer
      class={cn(
        'border-t border-border bg-surface-elevated px-6 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-center',
        props.class || props.className
      )}
    >
      <nav
        aria-label={t('footer.legalNav')}
        class="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-3"
      >
        <Link
          href={ROUTE_TERMS}
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t('footer.terms')}
        </Link>
        <Link
          href={ROUTE_PRIVACY}
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t('footer.privacy')}
        </Link>
        <Link
          href={ROUTE_COOKIES}
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t('footer.cookies')}
        </Link>
        <Link
          href={ROUTE_CONTACT}
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t('footer.contact')}
        </Link>
      </nav>
      <p class="text-xs text-muted-foreground">
        {t('footer.copyright', { year })}
      </p>
    </footer>
  );
}
