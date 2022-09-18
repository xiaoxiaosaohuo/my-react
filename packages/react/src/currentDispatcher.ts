import { Action } from "shared/ReactTypes";

export type Dispatcher = {
  useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
};
export type Dispatch<State> = (action: Action<State>) => void;

const currentDispatcher: { current: null | Dispatcher } = {
  current: null,
};

export const resolveDispatcher = () => {
  const dispatcher = currentDispatcher.current;
  if (dispatcher === null) {
    console.error("resolveDispatcher");
  }
  return dispatcher;
};

export default currentDispatcher;
