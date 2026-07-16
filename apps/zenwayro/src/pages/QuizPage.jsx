import { createSignal, navigate } from 'grainlet';
import { Button } from '../design-system/ui/button.jsx';
import {
  Tag,
  Slider,
  QuestionCard,
  ImageOption,
} from '../components/quiz/QuizPrimitives.jsx';
import { completeQuiz, isAuthenticated } from '../api/client.js';
import { t } from '../i18n/t.js';
import { writePendingQuiz } from '../lib/pending.js';
import { toast } from '../components/Toast.jsx';
import { getErrorMessage } from '../utils/errors.js';
import {
  ROUTE_AUTH_SIGNUP,
  ROUTE_EXPLORE,
  ROUTE_HOME,
} from '../constants/routes.js';

/** Exact from frontend QuizFlow.constants.ts */
export const INTERESTS = [
  'museums',
  'nature',
  'food',
  'nightlife',
  'architecture',
  'art',
  'history',
  'shopping',
];

export const INTEREST_KEYS = {
  museums: 'quiz.interestMuseums',
  nature: 'quiz.interestNature',
  food: 'quiz.interestFood',
  nightlife: 'quiz.interestNightlife',
  architecture: 'quiz.interestArchitecture',
  art: 'quiz.interestArt',
  history: 'quiz.interestHistory',
  shopping: 'quiz.interestShopping',
};

export const VIBES = [
  { id: 'relaxed', labelKey: 'quiz.vibeRelaxed', src: '/quiz/vibes/relaxed_cafe.jpg' },
  { id: 'market', labelKey: 'quiz.vibeMarket', src: '/quiz/vibes/bustling_market.jpg' },
  { id: 'park', labelKey: 'quiz.vibePark', src: '/quiz/vibes/quiet_park.jpg' },
  { id: 'bar', labelKey: 'quiz.vibeBar', src: '/quiz/vibes/lively_bar.jpg' },
];

export const BUDGET_OPTIONS = [
  { value: 'free', labelKey: 'quiz.budgetFree' },
  { value: 'moderate', labelKey: 'quiz.budgetModerate' },
  { value: 'any', labelKey: 'quiz.budgetNoLimit' },
];

export const DURATION_OPTIONS = [
  { labelKey: 'quiz.halfDay', value: 0.5 },
  { labelKey: 'quiz.fullDay', value: 1 },
  { labelKey: 'quiz.twoDays', value: 3 },
  { labelKey: 'quiz.fourDays', value: 7 },
];

export const TOTAL_STEPS = 6;

function defaultPreferences() {
  return {
    museums: 0.1,
    nature: 0.1,
    food: 0.1,
    nightlife: 0.1,
    architecture: 0.1,
    art: 0.1,
    history: 0.1,
    shopping: 0.1,
    pace: 5,
    walkingKm: 8,
    budget: 'moderate',
    durationDays: 1,
  };
}

/**
 * Faithful port of frontend QuizFlow.tsx — same layout, atoms, progress, steps.
 */
export function QuizPage() {
  const [step, setStep] = createSignal(0);
  const [prefs, setPrefs] = createSignal(defaultPreferences());
  const [selectedInterests, setSelectedInterests] = createSignal(new Set());
  const [selectedVibe, setSelectedVibe] = createSignal(undefined);
  const [submitting, setSubmitting] = createSignal(false);

  const toggleInterest = (interest) => {
    const next = new Set(selectedInterests());
    if (next.has(interest)) next.delete(interest);
    else next.add(interest);
    setSelectedInterests(next);
  };

  const updatePref = (key, value) => {
    setPrefs({ ...prefs(), [key]: value });
  };

  const next = () => setStep(Math.min(step() + 1, TOTAL_STEPS - 1));
  const prev = () => setStep(Math.max(step() - 1, 0));

  const handleBack = () => {
    if (step() === 0) {
      navigate(ROUTE_HOME);
      return;
    }
    prev();
  };

  const handleSubmit = async () => {
    const finalPrefs = { ...prefs() };
    for (const interest of INTERESTS) {
      finalPrefs[interest] = selectedInterests().has(interest) ? 0.9 : 0.1;
    }
    finalPrefs.vibe = selectedVibe();

    if (!isAuthenticated()) {
      writePendingQuiz(finalPrefs);
      navigate(ROUTE_AUTH_SIGNUP);
      return;
    }

    setSubmitting(true);
    try {
      await completeQuiz(finalPrefs);
      navigate(ROUTE_EXPLORE);
    } catch (err) {
      toast(getErrorMessage(err, t('quiz.submitToastError')), {
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const s = step();
  const p = prefs();
  const progress = ((s + 1) / TOTAL_STEPS) * 100;

  let stepBody = null;
  if (s === 0) {
    stepBody = (
      <QuestionCard
        question={t('quiz.whatDrawsYou')}
        subtitle={t('quiz.selectAllThatApply')}
      >
        <div class="flex flex-wrap gap-2 justify-center">
          {INTERESTS.map((i) => (
            <Tag
              label={t(INTEREST_KEYS[i])}
              selected={selectedInterests().has(i)}
              onClick={() => toggleInterest(i)}
            />
          ))}
        </div>
      </QuestionCard>
    );
  } else if (s === 1) {
    stepBody = (
      <QuestionCard question={t('quiz.pickTheVibe')}>
        <div class="grid grid-cols-2 gap-4">
          {VIBES.map((v) => (
            <ImageOption
              src={v.src}
              label={t(v.labelKey)}
              selected={selectedVibe() === v.id}
              onClick={() => setSelectedVibe(v.id)}
            />
          ))}
        </div>
      </QuestionCard>
    );
  } else if (s === 2) {
    stepBody = (
      <QuestionCard question={t('quiz.howPacked')} subtitle={t('quiz.stopsPerDay')}>
        <Slider
          min={3}
          max={8}
          value={p.pace}
          onChange={(v) => updatePref('pace', v)}
          valueSuffix={` ${t('quiz.stopsPerDaySuffix')}`}
        />
      </QuestionCard>
    );
  } else if (s === 3) {
    stepBody = (
      <QuestionCard
        question={t('quiz.walkingTolerance')}
        subtitle={t('quiz.walkingToleranceSubtitle')}
      >
        <Slider
          min={2}
          max={15}
          value={p.walkingKm}
          onChange={(v) => updatePref('walkingKm', v)}
          valueSuffix={` ${t('quiz.kmSuffix')}`}
        />
      </QuestionCard>
    );
  } else if (s === 4) {
    stepBody = (
      <QuestionCard question={t('quiz.budgetPreference')}>
        <div class="flex gap-3 justify-center">
          {BUDGET_OPTIONS.map((b) => (
            <Tag
              label={t(b.labelKey)}
              selected={p.budget === b.value}
              onClick={() => updatePref('budget', b.value)}
            />
          ))}
        </div>
      </QuestionCard>
    );
  } else {
    stepBody = (
      <QuestionCard question={t('quiz.howLong')}>
        <div class="flex flex-wrap gap-3 justify-center">
          {DURATION_OPTIONS.map((d) => (
            <Tag
              label={t(d.labelKey)}
              selected={p.durationDays === d.value}
              onClick={() => updatePref('durationDays', d.value)}
            />
          ))}
        </div>
      </QuestionCard>
    );
  }

  return (
    <div class="min-h-dvh flex flex-col">
      <div class="h-1 bg-gray-200 dark:bg-gray-800">
        <div
          class="h-full bg-indigo-600 transition-all duration-300"
          style={`width: ${progress}%`}
        />
      </div>

      <div class="flex-1 flex items-center justify-center p-6">{stepBody}</div>

      <div class="flex items-center justify-between px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-gray-200 dark:border-gray-800">
        <Button variant="ghost" onClick={handleBack}>
          {t('common.back')}
        </Button>
        <span class="text-sm text-gray-500">
          {s + 1} / {TOTAL_STEPS}
        </span>
        {s < TOTAL_STEPS - 1 ? (
          <Button onClick={next}>{t('common.next')}</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting()}>
            {submitting() ? t('quiz.saving') : t('quiz.savePreferences')}
          </Button>
        )}
      </div>
    </div>
  );
}
