import { createComponent, A } from '../../../../index.js';
import { Button } from '../design-system/ui/button.jsx';
import {
  IconArrowRight,
  IconChevronRight,
  IconMap,
  IconShare,
  IconStar,
} from '../design-system/icons.jsx';
import { t } from '../i18n/t.js';
import { isAuthenticated, logout, useAuthToken } from '../api/client.js';
import {
  ROUTE_AUTH_SIGNIN,
  ROUTE_HOME,
  ROUTE_PLAN_NEW,
  ROUTE_POPULAR_TRIPS,
  ROUTE_QUIZ,
  routePopularTripById,
} from '../constants/routes.js';
import { AppFooter } from '../design-system/layouts/AuthLayout.jsx';
import {
  HOME_HERO_IMAGE,
  HOME_LANDING_FEATURES,
  HOME_PLAN_STYLE_TAG_KEYS,
  HOME_QUIZ_STYLE_TAG_KEYS,
} from '../constants/product.js';

const SAMPLE_POPULAR = [
  { id: 'lisbon', city: 'lisbon', durationDays: 2, cityImageCdnUrl: '' },
  { id: 'paris', city: 'paris', durationDays: 3, cityImageCdnUrl: '' },
  { id: 'rome', city: 'rome', durationDays: 4, cityImageCdnUrl: '' },
];

export const HomePage = createComponent(function HomePage() {
  const token = useAuthToken();
  const authed = Boolean(token());
  const isPlanMode = authed || isAuthenticated();
  const ctaHref = isPlanMode ? ROUTE_PLAN_NEW : ROUTE_QUIZ;
  const ctaLabel = isPlanMode ? t('nav.planTrip') : t('home.startQuiz');
  const cardTitleKey = isPlanMode ? 'home.planCardTitle' : 'home.quizCardTitle';
  const cardSubtitleKey = isPlanMode
    ? 'home.planCardSubtitle'
    : 'home.quizCardSubtitle';
  const cardTagKeys = isPlanMode
    ? HOME_PLAN_STYLE_TAG_KEYS
    : HOME_QUIZ_STYLE_TAG_KEYS;
  const popularTrips = SAMPLE_POPULAR;

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
            <A
              href={ROUTE_HOME}
              class="text-xl font-bold tracking-tight text-white"
            >
              {t('common.appName')}
            </A>
          </div>
          {authed ? (
            <button
              type="button"
              onClick={logout}
              class="text-sm font-medium text-white/80"
            >
              {t('nav.signOut')}
            </button>
          ) : (
            <A href={ROUTE_AUTH_SIGNIN} class="text-sm font-medium text-white/80">
              {t('nav.signIn')}
            </A>
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
            <A href={ctaHref}>
              <Button class="h-auto w-full rounded-2xl border-0 py-6 text-base font-semibold text-white shadow-lg shadow-orange-900/30 coral-gradient hover:opacity-90">
                <span>{ctaLabel}</span>
                <IconChevronRight size={18} class="ml-1" />
              </Button>
            </A>
            <A href={ROUTE_POPULAR_TRIPS}>
              <Button
                variant="outline"
                class="h-auto w-full rounded-2xl border-white/40 bg-white/10 py-6 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20"
              >
                {t('nav.popularTrips')}
              </Button>
            </A>
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
          <A href={ctaHref}>
            <Button class="h-auto w-full rounded-xl border-0 py-5 text-sm font-semibold text-white coral-gradient hover:opacity-90">
              {ctaLabel} <IconArrowRight size={16} class="ml-1.5" />
            </Button>
          </A>
        </div>
      </div>

      <section class="mt-8 px-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-foreground">{t('nav.popularTrips')}</h2>
          <A href={ROUTE_POPULAR_TRIPS} class="text-sm font-medium text-[#3b6fa0]">
            {t('home.seeAll')}
          </A>
        </div>
        <div class="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {popularTrips.map((trip) => {
            const title = trip.city.charAt(0).toUpperCase() + trip.city.slice(1);
            const daysLabel =
              trip.durationDays === 1
                ? t('popularTrips.daysSingular')
                : t('popularTrips.daysTag', { count: String(trip.durationDays) });
            return (
              <A
                href={routePopularTripById(trip.id)}
                class="relative h-56 w-44 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-md"
              >
                <div class="flex h-full w-full items-center justify-center bg-[#1e3a5f] text-3xl font-bold text-white">
                  {title.charAt(0)}
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <p class="text-base font-bold text-white">{title}</p>
                  <span class="mt-1 inline-block rounded-full bg-[#ff6b4a]/90 px-2 py-0.5 text-xs font-semibold text-white">
                    {daysLabel}
                  </span>
                </div>
              </A>
            );
          })}
        </div>
      </section>

      <section class="mt-10 px-5">
        <h2 class="mb-5 text-xl font-bold text-foreground">{t('home.whyZenwayro')}</h2>
        <div class="flex flex-col gap-4">
          {HOME_LANDING_FEATURES.map(({ iconKey, titleKey, descKey, iconClass }) => {
            const Icon =
              iconKey === 'share' ? IconShare : iconKey === 'explore' ? IconStar : IconMap;
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

      <div class="mt-8 hidden lg:block">
        <AppFooter />
      </div>
    </div>
  );
});
