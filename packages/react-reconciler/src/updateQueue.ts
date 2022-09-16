import { FiberNode } from "./fiber";

type UpdateAction = any;

export interface Update {
  action: UpdateAction;
}

export interface UpdateQueue {
  shared: {
    pending: Update | null;
  };
}

// create
export const createUpdate = (action: UpdateAction) => {
  return { action };
};
// insert

export const enqueueUpdate = (fiber: FiberNode, update: Update) => {
  const updateQueue = fiber.updateQueue;
  if (updateQueue !== null) {
    updateQueue.shared.pending = update;
  }
};

// initial

export const initializeUpdateQueue = (fiber: FiberNode) => {
  fiber.updateQueue = {
    shared: {
      pending: null,
    },
  };
};

// consume update

export const processUpdateQueue = (fiber: FiberNode) => {
  const updateQueue = fiber.updateQueue;
  let newState = null;
  if (updateQueue) {
    const pending = updateQueue.shared.pending;
    const pendingUpdate = pending;
    updateQueue.shared.pending = null;
    if (pendingUpdate) {
      const action = pendingUpdate.action;
      if (typeof action === "function") {
        newState = action();
      } else {
        newState = action;
      }
    }
  } else {
    console.error(fiber, "no updateQueue in processUpdateQueue ");
  }
  fiber.memoizedState = newState;
};
