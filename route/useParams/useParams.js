import { createSignal } from '../../signals/createSignal/createSignal.js';
import { getCurrentRouteMatch } from '../context/context.js';

const [getParams, setParams] = createSignal({});

/** Sync params signal when Router updates the active match. */
export function publishParams(params) {
  setParams(params && typeof params === 'object' ? params : {});
}

/**
 * @returns {() => Record<string, string>}
 */
export function useParams() {
  return () => {
    const fromSignal = getParams();
    if (fromSignal && Object.keys(fromSignal).length > 0) return fromSignal;
    return getCurrentRouteMatch()?.params ?? {};
  };
}
