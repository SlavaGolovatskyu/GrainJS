import { getLocationSignal } from '../location/location.js';

/** @returns {() => { pathname, search, hash, state }} */
export function useLocation() {
  return getLocationSignal();
}
