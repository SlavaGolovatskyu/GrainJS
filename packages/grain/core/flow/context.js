let suspenseStack = [];

export function getSuspenseContext() {
  return suspenseStack[suspenseStack.length - 1] || null;
}

export function pushSuspenseContext(ctx) {
  suspenseStack.push(ctx);
}

export function popSuspenseContext() {
  suspenseStack.pop();
}
