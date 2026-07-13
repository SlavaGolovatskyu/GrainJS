export let currentEffect = null;
export let currentComponent = null;

export function setCurrentEffect(effect) {
  currentEffect = effect;
}

export function setCurrentComponent(component) {
  currentComponent = component;
}

/** Enter an effect tracking context; returns previous effect for restore. */
export function pushEffect(effect) {
  const previous = currentEffect;
  currentEffect = effect;
  return previous;
}

/** Leave an effect tracking context and restore the previous one. */
export function popEffect(previous) {
  currentEffect = previous;
}
