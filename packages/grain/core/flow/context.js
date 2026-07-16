let suspenseStack = [];
let errorBoundaryStack = [];

export function getSuspenseContext() {
  return suspenseStack[suspenseStack.length - 1] || null;
}

export function pushSuspenseContext(ctx) {
  suspenseStack.push(ctx);
}

export function popSuspenseContext() {
  suspenseStack.pop();
}

export function getErrorBoundary() {
  return errorBoundaryStack[errorBoundaryStack.length - 1] || null;
}

export function pushErrorBoundary(api) {
  errorBoundaryStack.push(api);
}

export function popErrorBoundary() {
  errorBoundaryStack.pop();
}
