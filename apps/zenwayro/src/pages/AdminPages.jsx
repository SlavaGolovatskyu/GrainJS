import { createComponent, A } from '../../../../index.js';
import { t } from '../i18n/t.js';
import {
  ROUTE_ADMIN,
  ROUTE_ADMIN_AI_ENRICHMENT,
  ROUTE_ADMIN_IMAGES,
  ROUTE_HOME,
} from '../constants/routes.js';
import { Button } from '../design-system/ui/button.jsx';

export const AdminPage = createComponent(function AdminPage() {
  return (
    <div class="mx-auto max-w-3xl px-4 py-8">
      <A href={ROUTE_HOME} class="text-sm text-[#3b6fa0]">
        {t('nav.home')}
      </A>
      <h1 class="mt-3 text-3xl font-bold">{t('nav.admin')}</h1>
      <p class="mb-6 text-muted-foreground">
        Admin tools ported for navigation parity. Wire RBAC against the backend when ready.
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <A href={ROUTE_ADMIN_IMAGES} class="rounded-2xl border border-border bg-card p-5">
          <h2 class="font-bold">{t('nav.contentImages')}</h2>
          <p class="text-sm text-muted-foreground">Manage content images</p>
        </A>
        <A
          href={ROUTE_ADMIN_AI_ENRICHMENT}
          class="rounded-2xl border border-border bg-card p-5"
        >
          <h2 class="font-bold">AI enrichment</h2>
          <p class="text-sm text-muted-foreground">City / POI enrichment jobs</p>
        </A>
        <A href={`${ROUTE_ADMIN}/users`} class="rounded-2xl border border-border bg-card p-5">
          <h2 class="font-bold">Users</h2>
          <p class="text-sm text-muted-foreground">User administration</p>
        </A>
        <A href={`${ROUTE_ADMIN}/cities/create`} class="rounded-2xl border border-border bg-card p-5">
          <h2 class="font-bold">Create city</h2>
          <p class="text-sm text-muted-foreground">Add covered destinations</p>
        </A>
      </div>
    </div>
  );
});

export const AdminImagesPage = createComponent(function AdminImagesPage() {
  return (
    <div class="px-4 py-8">
      <A href={ROUTE_ADMIN} class="text-sm text-[#3b6fa0]">
        {t('nav.admin')}
      </A>
      <h1 class="mt-2 text-2xl font-bold">{t('nav.contentImages')}</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Image management UI — connect to admin images API.
      </p>
      <Button class="mt-4" variant="outline" disabled>
        Upload (API pending)
      </Button>
    </div>
  );
});

export const AdminAiPage = createComponent(function AdminAiPage() {
  return (
    <div class="px-4 py-8">
      <A href={ROUTE_ADMIN} class="text-sm text-[#3b6fa0]">
        {t('nav.admin')}
      </A>
      <h1 class="mt-2 text-2xl font-bold">AI enrichment</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Queue and monitor enrichment jobs for cities and places.
      </p>
    </div>
  );
});

export const AdminUsersPage = createComponent(function AdminUsersPage() {
  return (
    <div class="px-4 py-8">
      <A href={ROUTE_ADMIN} class="text-sm text-[#3b6fa0]">
        {t('nav.admin')}
      </A>
      <h1 class="mt-2 text-2xl font-bold">Users</h1>
      <p class="mt-2 text-sm text-muted-foreground">User list / roles — API pending.</p>
    </div>
  );
});

export const AdminCitiesPage = createComponent(function AdminCitiesPage() {
  return (
    <div class="px-4 py-8">
      <A href={ROUTE_ADMIN} class="text-sm text-[#3b6fa0]">
        {t('nav.admin')}
      </A>
      <h1 class="mt-2 text-2xl font-bold">Create city</h1>
      <p class="mt-2 text-sm text-muted-foreground">City creation form — API pending.</p>
    </div>
  );
});

export const NotFoundPage = createComponent(function NotFoundPage() {
  return (
    <div class="px-4 py-16 text-center">
      <h1 class="text-3xl font-bold">404</h1>
      <p class="mb-4 text-muted-foreground">Page not found</p>
      <A href={ROUTE_HOME}>
        <Button class="coral-gradient border-0 text-white">{t('nav.home')}</Button>
      </A>
    </div>
  );
});
