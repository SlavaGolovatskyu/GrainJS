import { createSignal, createEffect, onCleanup } from 'grainlet';

/**
 * Tiny query helper — replaces common TanStack Query read patterns.
 * @returns {{ data: Function, error: Function, loading: Function, refetch: Function }}
 */
export function createResource(fetcher, { immediate = true } = {}) {
  const [data, setData] = createSignal(null);
  const [error, setError] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (immediate) {
    createEffect(() => {
      let cancelled = false;
      setLoading(true);
      fetcher()
        .then((result) => {
          if (!cancelled) setData(result);
        })
        .catch((err) => {
          if (!cancelled) setError(err);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      onCleanup(() => {
        cancelled = true;
      });
    });
  }

  return { data, error, loading, refetch, setData };
}
