/**
 * JSX Runtime — automatic + classic compatible
 *
 * Automatic (Vite): jsx(type, props, key?) with children in props.children
 * Classic / jsxDEV bridge: jsx(type, props, ...children)
 */

export {
  template,
  mountTemplate,
  bindTemplateText,
  bindTemplateProp,
  bindTemplateEvent,
  walkPath,
} from '../dom/template.js';

export function jsx(type, props, ...rest) {
  const input = props || {};
  const hasChildrenProp = Object.prototype.hasOwnProperty.call(input, 'children');

  let childSource;
  if (hasChildrenProp) {
    childSource = input.children;
  } else {
    // Classic / jsxDEV pass children as rest args.
    // Automatic runtime may pass a key as the only rest arg — ignore keys that
    // look like React keys (never empty, and only when props was a real object
    // without any child-like rest nodes). Prefer treating rest as children unless
    // rest is a single string AND props already looks like an empty host props bag
    // from automatic mode without classic children. Empty string key is rare;
    // classic text children like '+' must win.
    childSource = rest;
  }

  const flatChildren = (Array.isArray(childSource) ? childSource : [childSource])
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false);

  const finalProps = {};
  const isComponent =
    typeof type === 'string' ? /^[A-Z]/.test(type) : typeof type === 'function';

  Object.keys(input).forEach((key) => {
    if (key === 'children') return;
    const value = input[key];

    if (key === 'class' && !isComponent) {
      finalProps.className = value;
    } else if (!isComponent && (key === 'onClick' || key === 'onclick')) {
      // Host elements: normalize to onclick for applyProps
      finalProps.onclick = value;
    } else {
      // Components keep the prop name the caller used (onClick / onclick / …)
      finalProps[key] = value;
    }
  });

  return {
    type,
    props: finalProps,
    children: flatChildren,
    isComponent,
  };
}

export function Fragment(props) {
  const children = props?.children || [];
  const flatChildren = Array.isArray(children) ? children.flat(Infinity) : [children];

  return {
    type: Fragment,
    props: {},
    children: flatChildren.filter(
      (child) => child !== null && child !== undefined && child !== false
    ),
    isComponent: false,
  };
}

export function jsxs(type, props, ...children) {
  return jsx(type, props, ...children);
}
