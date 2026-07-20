export const ROUTE_HOME = '/';
export const ROUTE_EXPLORE = '/explore';
export const ROUTE_QUIZ = '/quiz';
export const ROUTE_TRIPS = '/trips';
export const ROUTE_SETTINGS = '/settings';
export const ROUTE_ADMIN = '/admin';
export const ROUTE_ADMIN_IMAGES = '/admin/images';
export const ROUTE_ADMIN_AI_ENRICHMENT = '/admin/ai-enrichment';
export const ROUTE_AUTH_SIGNUP = '/auth/signup';
export const ROUTE_AUTH_SIGNIN = '/auth/signin';
export const ROUTE_AUTH_SIGNIN_TRIP_PENDING =
  '/auth/signin?tripPending=true';
export const ROUTE_AUTH_FORGOT_PASSWORD = '/auth/forgot-password';
export const ROUTE_AUTH_RESET_PASSWORD = '/auth/reset-password';
export const ROUTE_AUTH_VERIFY_PENDING = '/auth/verify-pending';
export const ROUTE_AUTH_VERIFY = '/auth/verify';
export const ROUTE_TERMS = '/terms';
export const ROUTE_PRIVACY = '/privacy';
export const ROUTE_CONTACT = '/contact';
export const ROUTE_COOKIES = '/cookies';
export const ROUTE_POPULAR_TRIPS = '/popular-trips';
export const ROUTE_POPULAR_TRIPS_BROWSE = '/popular-trips/browse';
export const ROUTE_PLAN_NEW = '/plan/new';
export const ROUTE_AUTH = '/auth';
export const ROUTE_PLAN_SHARED_PREFIX = '/plan/shared/';

export const routePlanById = (tripId) => `/plan/${tripId}`;
export const routePopularTripById = (id) => `/popular-trips/${id}`;
export const routeSharedPlanBySlug = (slug) => `/plan/shared/${slug}`;

export const routeAuthSignInWithCallback = (callbackUrl) =>
  `${ROUTE_AUTH_SIGNIN}?callbackUrl=${encodeURIComponent(callbackUrl)}`;

export const routeAuthVerifyPendingWithEmail = (email) =>
  `${ROUTE_AUTH_VERIFY_PENDING}?email=${encodeURIComponent(email || '')}`;

export const routePlanNewWithCity = (city, cityId) => {
  const qs = new URLSearchParams();
  if (city) qs.set('city', city);
  if (cityId) qs.set('cityId', cityId);
  const s = qs.toString();
  return s ? `${ROUTE_PLAN_NEW}?${s}` : ROUTE_PLAN_NEW;
};

export const routeExploreWithCity = (city, cityId) => {
  const qs = new URLSearchParams();
  if (city) qs.set('city', city);
  if (cityId) qs.set('cityId', cityId);
  const s = qs.toString();
  return s ? `${ROUTE_EXPLORE}?${s}` : ROUTE_EXPLORE;
};

const PUBLIC_EXACT = [
  ROUTE_HOME,
  ROUTE_TERMS,
  ROUTE_PRIVACY,
  ROUTE_CONTACT,
  ROUTE_COOKIES,
  ROUTE_EXPLORE,
  ROUTE_QUIZ,
  ROUTE_AUTH,
];

const PUBLIC_PREFIXES = [
  `${ROUTE_AUTH}/`,
  ROUTE_PLAN_SHARED_PREFIX,
  ROUTE_POPULAR_TRIPS,
  '/plan/',
];

export function isPublicPathname(pathname) {
  const path = pathname || '/';
  if (PUBLIC_EXACT.includes(path)) return true;
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export const NAVBAR_EXCLUDED_PATHS = [ROUTE_QUIZ];
