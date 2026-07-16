/**
 * Babel plugin: wrap reactive JSX expressions for fine-grained DOM bindings.
 *
 *   {count()}        →  {() => count()}
 *   {`Hi ${name()}`} →  {() => `Hi ${name()}`}
 *   title={name()}   →  title={() => name()}
 *
 * Leave as-is:
 *   {count}              // signal getter already binds
 *   {() => count()}      // already an accessor
 *   onclick={handler}    // events
 *   {show() && <div/>}   // control flow with JSX (needs parent re-render for now)
 */

function containsJSX(path) {
  let found = false;
  path.traverse({
    JSXElement() {
      found = true;
    },
    JSXFragment() {
      found = true;
    },
  });
  return found;
}

function isEventAttrName(name) {
  if (typeof name !== 'string') return false;
  return name === 'onclick' || name === 'onClick' || /^on[A-Z]/.test(name);
}

export default function wrapJsxAccessors({ types: t }) {
  function shouldWrap(exprPath) {
    const expr = exprPath.node;
    if (!expr) return false;
    if (t.isArrowFunctionExpression(expr) || t.isFunctionExpression(expr)) return false;
    if (t.isIdentifier(expr)) return false;
    if (
      t.isStringLiteral(expr) ||
      t.isNumericLiteral(expr) ||
      t.isBooleanLiteral(expr) ||
      t.isNullLiteral(expr) ||
      t.isBigIntLiteral(expr)
    ) {
      return false;
    }
    if (t.isJSXElement(expr) || t.isJSXFragment(expr)) return false;
    if (containsJSX(exprPath)) return false;
    // Structural slot — parent re-render supplies new children; do not text-bind.
    if (
      t.isMemberExpression(expr) &&
      !expr.computed &&
      t.isIdentifier(expr.property, { name: 'children' })
    ) {
      return false;
    }
    return true;
  }

  function wrap(expr) {
    return t.arrowFunctionExpression([], t.parenthesizedExpression(expr));
  }

  return {
    name: 'wrap-jsx-accessors',
    visitor: {
      JSXExpressionContainer(path) {
        const parent = path.parentPath;
        if (parent.isJSXAttribute()) {
          const nameNode = parent.node.name;
          const attrName = t.isJSXIdentifier(nameNode)
            ? nameNode.name
            : nameNode?.name;
          if (isEventAttrName(attrName)) return;
        }

        const exprPath = path.get('expression');
        if (exprPath.isJSXEmptyExpression()) return;
        if (!shouldWrap(exprPath)) return;

        exprPath.replaceWith(wrap(exprPath.node));
      },
    },
  };
}
