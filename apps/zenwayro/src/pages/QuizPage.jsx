import { createSignal, Link, navigate } from 'grain';
import { Button } from '../design-system/ui/button.jsx';
import { completeQuiz, isAuthenticated } from '../api/client.js';
import { t } from '../i18n/t.js';
import {
  BUDGET_OPTIONS,
  DURATION_OPTIONS,
  INTEREST_KEYS,
  INTERESTS,
  QUIZ_TOTAL_STEPS,
  VIBES,
} from '../constants/product.js';
import { ROUTE_AUTH_SIGNUP, ROUTE_EXPLORE, ROUTE_HOME } from '../constants/routes.js';
import { cn } from '../design-system/utils/cn.js';

export function QuizPage() {
  const [step, setStep] = createSignal(0);
  const [interests, setInterests] = createSignal({});
  const [vibe, setVibe] = createSignal('');
  const [budget, setBudget] = createSignal('moderate');
  const [duration, setDuration] = createSignal(1);
  const [stops, setStops] = createSignal(5);
  const [walkKm, setWalkKm] = createSignal(8);
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal('');

  const toggleInterest = (id) => {
    setInterests({ ...interests(), [id]: !interests()[id] });
  };

  const submit = async () => {
    const prefs = {
      vibe: vibe() || undefined,
      budget: budget(),
      durationDays: duration(),
      stopsPerDay: stops(),
      walkingKm: walkKm(),
    };
    INTERESTS.forEach((id) => {
      prefs[id] = interests()[id] ? 0.9 : 0.1;
    });

    setBusy(true);
    setError('');
    try {
      if (!isAuthenticated()) {
        localStorage.setItem('pendingQuiz', JSON.stringify({ preferences: prefs }));
        navigate(ROUTE_AUTH_SIGNUP);
        return;
      }
      await completeQuiz(prefs);
      navigate(ROUTE_EXPLORE);
    } catch (err) {
      try {
        localStorage.setItem('pendingQuiz', JSON.stringify({ preferences: prefs }));
      } catch {
        /* ignore */
      }
      setError(err.message || t('quiz.submitToastError'));
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (step() < QUIZ_TOTAL_STEPS - 1) setStep(step() + 1);
    else submit();
  };
  const back = () => {
    if (step() === 0) navigate(ROUTE_HOME);
    else setStep(step() - 1);
  };

  const progress = ((step() + 1) / QUIZ_TOTAL_STEPS) * 100;

  return (
    <div class="mx-auto max-w-lg px-4 py-6">
      <div class="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
        <div class="h-full bg-[#ff6b4a] transition-all" style={`width:${progress}%`} />
      </div>

      {step() === 0 ? (
        <div>
          <h1 class="mb-1 text-2xl font-bold text-foreground">{t('quiz.whatDrawsYou')}</h1>
          <p class="mb-4 text-sm text-muted-foreground">{t('quiz.selectAllThatApply')}</p>
          <div class="flex flex-wrap gap-2">
            {INTERESTS.map((id) => (
              <button
                type="button"
                class={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition',
                  interests()[id]
                    ? 'border-[#ff6b4a] bg-[#ff6b4a]/10 text-[#ff6b4a]'
                    : 'border-border bg-card text-muted-foreground'
                )}
                onClick={() => toggleInterest(id)}
              >
                {t(INTEREST_KEYS[id])}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step() === 1 ? (
        <div>
          <h1 class="mb-4 text-2xl font-bold text-foreground">{t('quiz.pickTheVibe')}</h1>
          <div class="grid grid-cols-2 gap-3">
            {VIBES.map((v) => (
              <button
                type="button"
                class={cn(
                  'rounded-2xl border p-4 text-left text-sm font-semibold',
                  vibe() === v.id
                    ? 'border-[#ff6b4a] bg-[#ff6b4a]/10 text-[#ff6b4a]'
                    : 'border-border bg-card'
                )}
                onClick={() => setVibe(v.id)}
              >
                {t(v.labelKey)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step() === 2 ? (
        <div>
          <h1 class="mb-2 text-2xl font-bold text-foreground">{t('quiz.howPacked')}</h1>
          <p class="mb-4 text-sm text-muted-foreground">
            {t('quiz.stopsPerDay')}: {stops()} {t('quiz.stopsPerDaySuffix')}
          </p>
          <input
            type="range"
            min="2"
            max="12"
            value={stops()}
            onInput={(e) => setStops(Number(e.target.value))}
            class="w-full accent-[#ff6b4a]"
          />
          <p class="mb-2 mt-6 text-sm text-muted-foreground">
            {t('quiz.walkingTolerance')} — {walkKm()} {t('quiz.kmSuffix')}
          </p>
          <input
            type="range"
            min="1"
            max="20"
            value={walkKm()}
            onInput={(e) => setWalkKm(Number(e.target.value))}
            class="w-full accent-[#ff6b4a]"
          />
        </div>
      ) : null}

      {step() === 3 ? (
        <div>
          <h1 class="mb-4 text-2xl font-bold text-foreground">{t('quiz.budgetPreference')}</h1>
          <div class="flex flex-col gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                type="button"
                class={cn(
                  'rounded-xl border px-4 py-3 text-left font-medium',
                  budget() === opt.value
                    ? 'border-[#ff6b4a] bg-[#ff6b4a]/10 text-[#ff6b4a]'
                    : 'border-border bg-card'
                )}
                onClick={() => setBudget(opt.value)}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step() === 4 ? (
        <div>
          <h1 class="mb-4 text-2xl font-bold text-foreground">{t('quiz.howLong')}</h1>
          <div class="grid grid-cols-2 gap-3">
            {DURATION_OPTIONS.map((opt) => (
              <button
                type="button"
                class={cn(
                  'rounded-2xl border p-4 text-sm font-semibold',
                  duration() === opt.value
                    ? 'border-[#ff6b4a] bg-[#ff6b4a]/10 text-[#ff6b4a]'
                    : 'border-border bg-card'
                )}
                onClick={() => setDuration(opt.value)}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {error() ? <p class="mt-4 text-sm text-destructive">{error()}</p> : null}

      <div class="mt-8 flex gap-3">
        <Button variant="outline" class="flex-1" onClick={back}>
          {t('common.back')}
        </Button>
        <Button
          class="flex-1 coral-gradient border-0 text-white"
          disabled={busy()}
          onClick={next}
        >
          {busy()
            ? t('quiz.saving')
            : step() === QUIZ_TOTAL_STEPS - 1
              ? t('quiz.getMyItinerary')
              : t('common.next')}
        </Button>
      </div>
      <p class="mt-4 text-center text-sm text-muted-foreground">
        <Link href={ROUTE_HOME}>{t('nav.home')}</Link>
      </p>
    </div>
  );
}
