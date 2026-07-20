import { Link, useLocation } from 'grainlet/route';
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
import { Button } from '../ui/button.jsx';
import { NotificationsPanel } from '../../components/NotificationsPanel.jsx';
import {
  IconBookOpen,
  IconCompass,
  IconMap,
  IconUser,
  IconUsers,
} from '../icons.jsx';

const CORAL = '#ff6b4a';
const BASENAME = '/zenwayro';

function appPath(pathname) {
  if (!pathname) return '/';
  if (pathname === BASENAME || pathname === `${BASENAME}/`) return '/';
  if (pathname.startsWith(`${BASENAME}/`)) return pathname.slice(BASENAME.length) || '/';
  return pathname;
}

/** Faithful port of frontend AppNavbar.component.tsx */
export function AppNavbar() {
  const location = useLocation();
  const token = useAuthToken();
  const pathname = appPath(location().pathname);
  const showAuthenticatedUi = Boolean(token());

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
        <Link href={ROUTE_HOME} class="!text-foreground font-bold tracking-tight">
          {t('common.appName')}
        </Link>
      </div>
      <div class="flex items-center gap-2">
        {showAuthenticatedUi ? (
          <>
            <NotificationsPanel />
            <Button variant="ghost" size="sm" onClick={logout}>
              {t('nav.signOut')}
            </Button>
          </>
        ) : (
          <>
            <Link href={ROUTE_AUTH_SIGNIN}>
              <Button variant="ghost" size="sm">
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link href={ROUTE_AUTH_SIGNUP}>
              <Button
                size="sm"
                class="coral-gradient border-0 text-white hover:opacity-90"
              >
                {t('nav.signUp')}
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

/** Faithful port of frontend BottomNav.component.tsx */
export function BottomNav() {
  const location = useLocation();
  const token = useAuthToken();
  const pathname = appPath(location().pathname);
  const showAuthenticatedUi = Boolean(token());

  if (
    NAVBAR_EXCLUDED_PATHS.includes(pathname) ||
    pathname === ROUTE_PLAN_NEW ||
    pathname.startsWith('/plan/')
  ) {
    return null;
  }

  const tripsHref = showAuthenticatedUi ? ROUTE_TRIPS : ROUTE_AUTH_SIGNIN;

  const navItems = [
    {
      href: ROUTE_HOME,
      label: t('nav.home'),
      Icon: IconCompass,
      match: (path) => path === ROUTE_HOME,
    },
    {
      href: ROUTE_EXPLORE,
      label: t('nav.explore'),
      Icon: IconMap,
      match: (path) => path === ROUTE_EXPLORE || path.startsWith(`${ROUTE_EXPLORE}/`),
    },
    {
      href: ROUTE_POPULAR_TRIPS,
      label: t('nav.community'),
      Icon: IconUsers,
      match: (path) =>
        path === ROUTE_POPULAR_TRIPS || path.startsWith(`${ROUTE_POPULAR_TRIPS}/`),
    },
    {
      href: ROUTE_PLAN_NEW,
      label: t('nav.planTrip'),
      Icon: IconBookOpen,
      match: (path) => path.startsWith('/plan'),
    },
    {
      href: tripsHref,
      label: t('nav.me'),
      Icon: IconUser,
      match: (path) =>
        path === ROUTE_TRIPS ||
        path.startsWith(`${ROUTE_TRIPS}/`) ||
        path === '/settings' ||
        path.startsWith('/settings'),
    },
  ];

  return (
    <nav
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label={t('nav.primaryNavigation')}
    >
      <div class="mx-auto flex h-16 w-full max-w-4xl items-center justify-around px-2 md:px-4">
        {navItems.map(({ href, label, Icon, match }) => {
          const isActive = match(pathname);
          return (
            <Link
              href={href}
              class={cn(
                'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-xl px-2 py-1 transition-all duration-200',
                isActive ? 'text-[#ff6b4a]' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div class="relative flex flex-col items-center">
                <Icon
                  size={22}
                  class="transition-all duration-200"
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={isActive ? `stroke:${CORAL}` : undefined}
                />
                {isActive ? (
                  <span class="mt-0.5 h-1 w-1 rounded-full bg-[#ff6b4a]" />
                ) : null}
              </div>
              <span
                class={cn(
                  'mt-0.5 text-[10px] font-medium tracking-wide',
                  isActive ? 'text-[#ff6b4a]' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell(props) {
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
}
