import { createComponent, A, useLocation } from '../../../../../index.js';
import { cn } from '../utils/cn.js';
import {
  APP_SHELL_FOOTER_CLASSES,
  APP_SHELL_HEADER_CLASSES,
  APP_SHELL_MAIN_CLASSES,
  APP_SHELL_ROOT_CLASSES,
  APP_NAVBAR_ROOT_CLASSES,
} from '../../constants/product.js';
import {
  ROUTE_AUTH_SIGNIN,
  ROUTE_AUTH_SIGNUP,
  ROUTE_EXPLORE,
  ROUTE_HOME,
  ROUTE_PLAN_NEW,
  ROUTE_POPULAR_TRIPS,
  ROUTE_TRIPS,
  NAVBAR_EXCLUDED_PATHS,
} from '../../constants/routes.js';
import { logout, useAuthToken } from '../../api/client.js';
import { t } from '../../i18n/t.js';
import {
  IconBookOpen,
  IconCompass,
  IconMap,
  IconUser,
  IconUsers,
} from '../icons.jsx';
import { Button } from '../ui/button.jsx';

const CORAL = '#ff6b4a';
const BASENAME = '/zenwayro';

function appPath(pathname) {
  if (!pathname) return '/';
  if (pathname === BASENAME || pathname === `${BASENAME}/`) return '/';
  if (pathname.startsWith(`${BASENAME}/`)) return pathname.slice(BASENAME.length) || '/';
  return pathname;
}

export const AppNavbar = createComponent(function AppNavbar() {
  const location = useLocation();
  const token = useAuthToken();
  const pathname = appPath(location().pathname);

  if (NAVBAR_EXCLUDED_PATHS.includes(pathname)) return null;
  if (
    pathname === ROUTE_HOME ||
    pathname === ROUTE_TRIPS ||
    pathname === ROUTE_POPULAR_TRIPS ||
    pathname === ROUTE_PLAN_NEW
  ) {
    return null;
  }

  return (
    <nav class={APP_NAVBAR_ROOT_CLASSES} aria-label="Main navigation">
      <div class="flex items-center gap-2">
        <div class="coral-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <IconMap size={16} class="text-white" />
        </div>
        <A href={ROUTE_HOME} class="text-foreground font-bold tracking-tight">
          {t('common.appName')}
        </A>
      </div>
      <div class="flex items-center gap-2">
        {token() ? (
          <Button variant="ghost" size="sm" onClick={logout}>
            {t('nav.signOut')}
          </Button>
        ) : (
          <>
            <A href={ROUTE_AUTH_SIGNIN}>
              <Button variant="ghost" size="sm">
                {t('nav.signIn')}
              </Button>
            </A>
            <A href={ROUTE_AUTH_SIGNUP}>
              <Button
                size="sm"
                class="coral-gradient border-0 text-white hover:opacity-90"
              >
                {t('nav.signUp')}
              </Button>
            </A>
          </>
        )}
      </div>
    </nav>
  );
});

export const BottomNav = createComponent(function BottomNav() {
  const location = useLocation();
  const token = useAuthToken();
  const pathname = appPath(location().pathname);

  if (
    NAVBAR_EXCLUDED_PATHS.includes(pathname) ||
    pathname === ROUTE_PLAN_NEW ||
    pathname.startsWith('/plan/')
  ) {
    return null;
  }

  const tripsHref = token() ? ROUTE_TRIPS : ROUTE_AUTH_SIGNIN;

  const items = [
    {
      href: ROUTE_HOME,
      label: t('nav.home'),
      Icon: IconCompass,
      active: pathname === ROUTE_HOME,
    },
    {
      href: ROUTE_EXPLORE,
      label: t('nav.explore'),
      Icon: IconMap,
      active: pathname === ROUTE_EXPLORE || pathname.startsWith(`${ROUTE_EXPLORE}/`),
    },
    {
      href: ROUTE_POPULAR_TRIPS,
      label: t('nav.community'),
      Icon: IconUsers,
      active:
        pathname === ROUTE_POPULAR_TRIPS ||
        pathname.startsWith(`${ROUTE_POPULAR_TRIPS}/`),
    },
    {
      href: ROUTE_PLAN_NEW,
      label: t('nav.planTrip'),
      Icon: IconBookOpen,
      active: pathname.startsWith('/plan'),
    },
    {
      href: tripsHref,
      label: t('nav.me'),
      Icon: IconUser,
      active:
        pathname === ROUTE_TRIPS ||
        pathname.startsWith(`${ROUTE_TRIPS}/`) ||
        pathname === '/settings' ||
        pathname.startsWith('/settings'),
    },
  ];

  return (
    <nav
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label={t('nav.primaryNavigation')}
    >
      <div class="mx-auto flex h-16 w-full max-w-4xl items-center justify-around px-2 md:px-4">
        {items.map(({ href, label, Icon, active }) => (
          <A
            href={href}
            class={cn(
              'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-xl px-2 py-1 transition-all duration-200',
              active ? 'text-[#ff6b4a]' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div class="relative flex flex-col items-center">
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                style={active ? `stroke:${CORAL}` : undefined}
              />
              {active ? (
                <span class="mt-0.5 h-1 w-1 rounded-full bg-[#ff6b4a]" />
              ) : null}
            </div>
            <span
              class={cn(
                'mt-0.5 text-[10px] font-medium tracking-wide',
                active ? 'text-[#ff6b4a]' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          </A>
        ))}
      </div>
    </nav>
  );
});

export const AppShell = createComponent(function AppShell(props) {
  const outlet = props.children;
  return (
    <div class={APP_SHELL_ROOT_CLASSES} data-ui-version="v2">
      <header class={APP_SHELL_HEADER_CLASSES}>
        <AppNavbar />
      </header>
      <main class={APP_SHELL_MAIN_CLASSES}>{outlet}</main>
      <footer class={APP_SHELL_FOOTER_CLASSES}>
        <BottomNav />
      </footer>
    </div>
  );
});
