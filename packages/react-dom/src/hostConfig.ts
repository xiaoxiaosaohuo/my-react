export type Container = Element | Document;
export type Instance = Element;

// create dom node
export const createInstance = (type: string) => {
  return document.createElement(type);
};

export const appendInitialChild = (parent: Instance, child: Instance) => {
  parent.appendChild(child);
};
