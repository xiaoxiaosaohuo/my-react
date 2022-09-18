import { FiberNode } from "./fiber";
import { Action } from "shared/ReactTypes";

export interface Update<State> {
  action: Action<State>;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}

// create
export const createUpdate = <State>(action: Action<State>) => {
  return { action };
};
// insert

export const enqueueUpdate = <Action>(
  updateQueue: UpdateQueue<Action>,
  update: Update<Action>
) => {
  updateQueue.shared.pending = update;
};

// initial

export const createUpdateQueue = <Action>() => {
  const updateQueue: UpdateQueue<Action> = {
    shared: {
      pending: null,
    },
  };
  return updateQueue;
};

// consume update

export const processUpdateQueue = <State>(fiber: FiberNode) => {
  const updateQueue = fiber.updateQueue as UpdateQueue<State>;
  let newState: State = fiber.memoizedState;
  if (updateQueue !== null) {
    const pending = updateQueue.shared.pending;
    const pendingUpdate = pending;
    updateQueue.shared.pending = null;
    if (pendingUpdate) {
      const action = pendingUpdate.action;
      if (action instanceof Function) {
        newState = action(newState);
      } else {
        newState = action;
      }
    }
  } else {
    console.error(fiber, "no updateQueue in processUpdateQueue ");
  }
  fiber.memoizedState = newState;
};
