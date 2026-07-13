export let currentRouteMatch = null;

export function setCurrentRouteMatch(match) {
  currentRouteMatch = match;
}

export function getCurrentRouteMatch() {
  return currentRouteMatch;
}
