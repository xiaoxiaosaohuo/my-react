import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Key, ElementType, Ref, Props, ReactElement } from "shared/ReactTypes";

const ReactElement = function (
  type: ElementType,
  key: Key,
  ref: Ref,
  props: Props
): ReactElement {
  const element: ReactElement = {
    // this tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,
    // Built-in properties that belong on the element
    type,
    key,
    ref,
    props,
  };
  return element;
};

function hasValidKey(config: any) {
  return config.key !== undefined;
}

function hasValidRef(config: any) {
  return config.ref !== undefined;
}
const jsx = (type: ElementType, config: any) => {
  let key: Key = null;
  const props: any = {};
  let ref: Ref = null;

  for (const prop in config) {
    const val = config[prop];
    if (prop === "key") {
      if (hasValidKey(config)) {
        key = "" + val;
      }
      continue;
    }
    if (prop === "ref" && val !== undefined) {
      if (hasValidRef(config)) {
        ref = "" + val;
      }
      continue;
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
  }
  return ReactElement(type, key, ref, props);
};

export const jsxDEV = jsx;
