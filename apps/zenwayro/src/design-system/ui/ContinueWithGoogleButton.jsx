import { createComponent } from '../../../../../index.js';
import { cn } from '../utils/cn.js';
import { t } from '../../i18n/t.js';
import { API_URL, applyAuthResponse } from '../../api/client.js';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const existing = document.querySelector('script[data-google-gsi]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', () =>
        reject(new Error(t('auth.googleSignInFailed')))
      );
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.googleGsi = '1';
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error(t('auth.googleSignInFailed')));
    document.head.appendChild(script);
  });
}

export async function exchangeGoogleIdToken(idToken, name) {
  const res = await fetch(`${API_URL}/api/auth/sync`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'google',
      idToken,
      ...(name ? { name } : {}),
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      data?.message || t('auth.googleSignInBackendSyncFailed')
    );
  }
  return applyAuthResponse(data);
}

/**
 * Opens Google Identity Services; resolves with auth payload after backend exchange.
 */
export async function signInWithGoogle() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(t('auth.googleSignInConfigError'));
  }

  const google = await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    document.body.appendChild(host);

    const cleanup = () => {
      try {
        host.remove();
      } catch {
        /* ignore */
      }
    };

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        cleanup();
        try {
          if (!response?.credential) {
            reject(new Error(t('auth.googleSignInNoIdToken')));
            return;
          }
          const data = await exchangeGoogleIdToken(response.credential);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.renderButton(host, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 320,
    });

    // Trigger the rendered Google button (GIS attaches a real clickable iframe/btn)
    requestAnimationFrame(() => {
      const btn =
        host.querySelector('div[role="button"]') ||
        host.querySelector('button') ||
        host.firstElementChild;
      if (btn) {
        btn.click();
      } else {
        google.accounts.id.prompt((notification) => {
          if (
            notification.isNotDisplayed() ||
            notification.isSkippedMoment() ||
            notification.isDismissedMoment()
          ) {
            cleanup();
            reject(new Error(t('auth.googleSignInFailed')));
          }
        });
      }
    });
  });
}

export const ContinueWithGoogleButton = createComponent(
  function ContinueWithGoogleButton(props) {
    // Prefer reading in-body so fine-grained wrappers don't become Boolean(fn) === true
    const disabledProp = props.disabled;
    const isDisabled =
      typeof disabledProp === 'function' ? !!disabledProp() : !!disabledProp;

    return (
      <button
        type="button"
        class={cn(
          'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
          props.class || props.className
        )}
        onClick={props.onClick}
        disabled={isDisabled}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.2 29.3 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21 21-9.3 21-21c0-1.2-.1-2.3-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.2 29.3 3 24 3 16.1 3 9.2 7.5 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 36.7 26.8 37.5 24 37.5c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.1 40.4 16 45 24 45z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.5 5.5-6.6 6.8l6.2 5.2C39.2 36.3 45 31 45 24c0-1.2-.1-2.3-.4-3.5z"
          />
        </svg>
        <span>{t('auth.continueWithGoogle')}</span>
      </button>
    );
  }
);
