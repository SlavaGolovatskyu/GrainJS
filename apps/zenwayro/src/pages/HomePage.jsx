import { createSignal, createEffect, Link } from 'grainlet';
import { Button } from '../design-system/ui/button.jsx';
import { AppFooter } from '../design-system/layouts/AuthLayout.jsx';
import {
  IconArrowRight,
  IconChevronRight,
  IconMap,
  IconShare,
  IconStar,
} from '../design-system/icons.jsx';
import { t } from '../i18n/t.js';
import {
  fetchPopularTrips,
  isAuthenticated,
  logout,
  useAuthToken,
} from '../api/client.js';
import {
  ROUTE_AUTH_SIGNIN,
  ROUTE_HOME,
  ROUTE_PLAN_NEW,
  ROUTE_POPULAR_TRIPS,
  ROUTE_QUIZ,
  routePopularTripById,
} from '../constants/routes.js';
import { resolveImageUrl } from '../utils/images.js';
import { normalizeList } from '../utils/errors.js';

/** Exact values from frontend HomePageV2.constants.ts */
export const HOME_HERO_IMAGE = '/images/home_bg.webp';
export const HOME_POPULAR_TRIPS_PREVIEW_LIMIT = 10;
export const HOME_QUIZ_STYLE_TAG_KEYS = [
  'home.quizTagFoodie',
  'home.quizTagCulture',
  'home.quizTagAdventure',
  'home.quizTagRelaxed',
];
export const HOME_PLAN_STYLE_TAG_KEYS = [
  'home.planTagWalking',
  'home.planTagDayByDay',
  'home.planTagLocal',
  'home.planTagShare',
];
export const HOME_LANDING_FEATURES = [
  {
    iconKey: 'plan',
    titleKey: 'home.landingFeaturePlanTitle',
    descKey: 'home.landingFeaturePlanDesc',
    iconClass: 'bg-[#0f1b3d]',
  },
  {
    iconKey: 'explore',
    titleKey: 'home.landingFeatureExploreTitle',
    descKey: 'home.landingFeatureExploreDesc',
    iconClass: 'bg-[#1e3a5f]',
  },
  {
    iconKey: 'share',
    titleKey: 'home.landingFeatureShareTitle',
    descKey: 'home.landingFeatureShareDesc',
    iconClass: 'coral-gradient',
  },
];

/**
 * Faithful Grain port of frontend HomePageV2.component.tsx — same structure & classes.
 */
export function HomePage() {
  const token = useAuthToken();
  const showAuthenticatedUi = Boolean(token()) || isAuthenticated();
  const [popularTrips, setPopularTrips] = createSignal([]);

  createEffect(() => {
    let cancelled = false;
    fetchPopularTrips({
      limit: String(HOME_POPULAR_TRIPS_PREVIEW_LIMIT),
      sort: 'likes',
      page: '1',
    })
      .then((data) => {
        if (cancelled) return;
        setPopularTrips(normalizeList(data, 'trips').length
          ? normalizeList(data, 'trips')
          : normalizeList(data, 'items'));
      })
      .catch(() => {
        if (!cancelled) setPopularTrips([]);
      });
    return () => {
      cancelled = true;
    };
  });

  const isPlanMode = showAuthenticatedUi;
  const ctaHref = isPlanMode ? ROUTE_PLAN_NEW : ROUTE_QUIZ;
  const ctaLabel = isPlanMode ? t('nav.planTrip') : t('home.startQuiz');
  const cardTitleKey = isPlanMode ? 'home.planCardTitle' : 'home.quizCardTitle';
  const cardSubtitleKey = isPlanMode
    ? 'home.planCardSubtitle'
    : 'home.quizCardSubtitle';
  const cardTagKeys = isPlanMode
    ? HOME_PLAN_STYLE_TAG_KEYS
    : HOME_QUIZ_STYLE_TAG_KEYS;

  return (
    <div class="min-h-full bg-background">
      <section class="relative flex min-h-[70vh] flex-col justify-end overflow-hidden">
        <div class="absolute inset-0">
          <img class="h-full w-full object-cover" src={HOME_HERO_IMAGE} alt="" />
          <div class="voyage-gradient absolute inset-0 opacity-70" />
        </div>

        <div class="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pt-4">
          <div class="flex items-center gap-2">
            <div class="coral-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <IconMap size={16} class="text-white" />
            </div>
            <Link
              href={ROUTE_HOME}
              class="!text-xl !font-bold tracking-tight !text-white"
            >
              {t('common.appName')}
            </Link>
          </div>
          {showAuthenticatedUi ? (
            <button
              type="button"
              onClick={logout}
              class="text-sm font-medium text-white/80"
            >
              {t('nav.signOut')}
            </button>
          ) : (
            <Link href={ROUTE_AUTH_SIGNIN} class="text-sm font-medium text-white/80">
              {t('nav.signIn')}
            </Link>
          )}
        </div>

        <div class="relative z-10 px-5 pb-8">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-[#ff8a70]">
            {t('home.premiumTagline')}
          </p>
          <h1 class="mb-4 text-4xl font-bold leading-tight text-white">
            {t('home.heroTitlePre')}
            <br />
            {t('home.heroTitleHighlight')}
            <br />
            <span class="text-[#ff6b4a]">{t('home.heroTitlePost')}</span>
          </h1>
          <p class="mb-8 text-base leading-relaxed text-white/70">
            {t('home.landingHeroSubtitle')}
          </p>

          <div class="flex flex-col gap-3">
            <Link href={ctaHref}>
              <Button class="h-auto w-full rounded-2xl border-0 py-6 text-base font-semibold text-white shadow-lg shadow-orange-900/30 coral-gradient hover:opacity-90">
                <span>{ctaLabel}</span>
                <IconChevronRight size={18} class="ml-1" />
              </Button>
            </Link>
            <Link href={ROUTE_POPULAR_TRIPS}>
              <Button
                variant="outline"
                class="h-auto w-full rounded-2xl border-white/40 bg-white/10 py-6 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20"
              >
                {t('nav.popularTrips')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div class="relative z-20 -mt-4 px-5">
        <div class="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-[#0f1b3d]/10">
          <div class="mb-3 flex items-center gap-3">
            <div class="coral-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
              <IconStar size={18} class="text-white" />
            </div>
            <div>
              <h3 class="text-base font-bold text-foreground">{t(cardTitleKey)}</h3>
              <p class="mt-0.5 text-xs text-muted-foreground">{t(cardSubtitleKey)}</p>
            </div>
          </div>
          <div class="mb-4 flex flex-wrap gap-2">
            {cardTagKeys.map((tagKey) => (
              <span class="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {t(tagKey)}
              </span>
            ))}
          </div>
          <Link href={ctaHref}>
            <Button class="h-auto w-full rounded-xl border-0 py-5 text-sm font-semibold text-white coral-gradient hover:opacity-90">
              {ctaLabel} <IconArrowRight size={16} class="ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {popularTrips().length > 0 ? (
        <section class="mt-8 px-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-foreground">{t('nav.popularTrips')}</h2>
            <Link href={ROUTE_POPULAR_TRIPS} class="text-sm font-medium text-[#3b6fa0]">
              {t('home.seeAll')}
            </Link>
          </div>
          <div class="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {popularTrips().map((trip) => {
              const cityName = trip.city || trip.title || 'Trip';
              const title =
                String(cityName).charAt(0).toUpperCase() + String(cityName).slice(1);
              const heroUrl = resolveImageUrl(
                (trip.cityImageCdnUrl || trip.imageUrl || '').trim()
              );
              const days = trip.durationDays || 1;
              const daysLabel =
                days === 1
                  ? t('popularTrips.daysSingular')
                  : t('popularTrips.daysTag', { count: String(days) });

              return (
                <Link
                  href={routePopularTripById(trip.id)}
                  class="relative h-56 w-44 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-md"
                >
                  {heroUrl ? (
                    <img src={heroUrl} alt="" class="h-full w-full object-cover" />
                  ) : (
                    <div class="flex h-full w-full items-center justify-center bg-[#1e3a5f] text-3xl font-bold text-white">
                      {title.charAt(0)}
                    </div>
                  )}
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div class="absolute bottom-0 left-0 right-0 p-3">
                    <p class="text-base font-bold text-white">{title}</p>
                    <span class="mt-1 inline-block rounded-full bg-[#ff6b4a]/90 px-2 py-0.5 text-xs font-semibold text-white">
                      {daysLabel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section class="mt-10 px-5">
        <h2 class="mb-5 text-xl font-bold text-foreground">{t('home.whyZenwayro')}</h2>
        <div class="flex flex-col gap-4">
          {HOME_LANDING_FEATURES.map(({ iconKey, titleKey, descKey, iconClass }) => {
            const Icon =
              iconKey === 'share'
                ? IconShare
                : iconKey === 'explore'
                  ? IconStar
                  : IconMap;
            return (
              <div class="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <div
                  class={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
                >
                  <Icon size={20} class="text-white" />
                </div>
                <div>
                  <h3 class="mb-1 text-base font-bold text-foreground">{t(titleKey)}</h3>
                  <p class="text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section class="mx-5 mb-4 mt-8 rounded-3xl p-5 text-center voyage-gradient">
        <div class="mb-2 flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map(() => (
            <IconStar size={16} class="fill-[#ff6b4a] text-[#ff6b4a]" fill="#ff6b4a" />
          ))}
        </div>
        <p class="mb-1 text-sm font-medium text-white/90">
          “{t('home.socialProofQuote')}”
        </p>
        <p class="text-xs text-white/50">— {t('home.socialProofAuthor')}</p>
        <div class="mt-4 flex justify-center gap-4 border-t border-white/10 pt-4">
          <div class="text-center">
            <p class="text-xl font-bold text-white">50K+</p>
            <p class="text-xs text-white/60">{t('home.statTravelers')}</p>
          </div>
          <div class="w-px bg-white/20" />
          <div class="text-center">
            <p class="text-xl font-bold text-white">200+</p>
            <p class="text-xs text-white/60">{t('home.statCities')}</p>
          </div>
          <div class="w-px bg-white/20" />
          <div class="text-center">
            <p class="text-xl font-bold text-white">4.9★</p>
            <p class="text-xs text-white/60">{t('home.statRating')}</p>
          </div>
        </div>
      </section>

      <div class="hidden lg:block">
        <AppFooter />
      </div>
    </div>
  );
}
