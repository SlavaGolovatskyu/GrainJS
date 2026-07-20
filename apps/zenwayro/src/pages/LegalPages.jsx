import { Link } from 'grainlet/route';
import { t } from '../i18n/t.js';
import {
  ROUTE_CONTACT,
  ROUTE_COOKIES,
  ROUTE_HOME,
  ROUTE_PRIVACY,
  ROUTE_TERMS,
} from '../constants/routes.js';

function LegalLayout(props) {
  const outlet = props.children;
  return (
    <article class="mx-auto max-w-3xl px-4 py-8">
      <Link href={ROUTE_HOME} class="text-sm text-[#3b6fa0]">
        {t('nav.home')}
      </Link>
      <h1 class="mt-3 mb-2 text-3xl font-bold text-foreground">{props.title}</h1>
      {props.subtitle ? (
        <p class="mb-6 text-muted-foreground">{props.subtitle}</p>
      ) : null}
      <div class="prose prose-sm max-w-none space-y-4 text-foreground">{outlet}</div>
      <nav class="mt-10 flex flex-wrap gap-4 border-t border-border pt-6 text-sm">
        <Link href={ROUTE_TERMS}>{t('footer.terms')}</Link>
        <Link href={ROUTE_PRIVACY}>{t('footer.privacy')}</Link>
        <Link href={ROUTE_COOKIES}>{t('footer.cookies')}</Link>
        <Link href={ROUTE_CONTACT}>{t('footer.contact')}</Link>
      </nav>
    </article>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title={t('footer.terms')}>
      <section>
        <h2 class="text-lg font-semibold">1. Acceptance</h2>
        <p class="text-sm text-muted-foreground">
          By using Zenwayro you agree to these Terms and Conditions. If you do not
          agree, do not use the service.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold">2. Accounts</h2>
        <p class="text-sm text-muted-foreground">
          You are responsible for safeguarding credentials and for activity under
          your account. Provide accurate registration information.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold">3. Content</h2>
        <p class="text-sm text-muted-foreground">
          Itineraries and shared trips remain yours; you grant Zenwayro a license to
          host and display published trips on Popular Trips.
        </p>
      </section>
    </LegalLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title={t('footer.privacy')}>
      <section>
        <h2 class="text-lg font-semibold">Data we collect</h2>
        <p class="text-sm text-muted-foreground">
          Account details, quiz preferences, trip content, and usage analytics needed
          to operate personalized planning.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold">How we use data</h2>
        <p class="text-sm text-muted-foreground">
          To provide itineraries, sync trips, improve recommendations, and communicate
          about your account.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold">Contact</h2>
        <p class="text-sm text-muted-foreground">
          Privacy questions: see the Contact page. Based in Ukraine (Ternopil Region).
        </p>
      </section>
    </LegalLayout>
  );
}

export function CookiesPage() {
  return (
    <LegalLayout title={t('footer.cookies')}>
      <section>
        <h2 class="text-lg font-semibold">Essential cookies</h2>
        <p class="text-sm text-muted-foreground">
          Used for authentication session tokens and security.
        </p>
      </section>
      <section>
        <h2 class="text-lg font-semibold">Analytics</h2>
        <p class="text-sm text-muted-foreground">
          Optional analytics cookies help us understand product usage. You can decline
          non-essential cookies in your browser settings.
        </p>
      </section>
    </LegalLayout>
  );
}

export function ContactPage() {
  return (
    <LegalLayout title={t('contact.heroTitle')} subtitle={t('contact.heroSubtitle')}>
      <section class="rounded-2xl border border-border bg-card p-5">
        <h2 class="mb-2 text-lg font-semibold">{t('contact.contactInfoTitle')}</h2>
        <p class="text-sm font-medium">{t('contact.emailTitle')}</p>
        <p class="text-sm text-muted-foreground">{t('contact.emailSubtitle')}</p>
        <a class="mt-2 inline-block text-[#3b6fa0]" href="mailto:hello@zenwayro.com">
          hello@zenwayro.com
        </a>
      </section>
      <section>
        <h2 class="text-lg font-semibold">{t('contact.quickInfoTitle')}</h2>
        <ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>{t('contact.quickInfoResponse')}</li>
          <li>{t('contact.quickInfoLocation')}</li>
          <li>{t('contact.quickInfoLanguages')}</li>
        </ul>
      </section>
      <section>
        <h2 class="mb-2 text-lg font-semibold">{t('contact.faqTitle')}</h2>
        <p class="text-sm font-medium">{t('contact.faqStartedQuestion')}</p>
        <p class="mb-3 text-sm text-muted-foreground">{t('contact.faqStartedAnswer')}</p>
        <p class="text-sm font-medium">{t('contact.faqSecureQuestion')}</p>
        <p class="text-sm text-muted-foreground">{t('contact.faqSecureAnswer')}</p>
      </section>
    </LegalLayout>
  );
}
