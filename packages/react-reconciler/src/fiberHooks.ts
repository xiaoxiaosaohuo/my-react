import { FiberNode } from "./fiber";
import { Dispatcher, Dispatch } from "react/src/currentDispatcher";
import { Action } from "shared/ReactTypes";
import sharedInternals from "shared/internals";

import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  UpdateQueue,
} from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";

let workInProgressHook: Hook | null = null;
let currentlyRenderingFiber: FiberNode | null = null;

interface Hook {
  memoizedState: any;
  updateQueue: unknown;
  next: Hook | null;
}

const { currentDispatcher } = sharedInternals;

export const renderWithHooks = (workInProgress: FiberNode) => {
  currentlyRenderingFiber = workInProgress;
  // reset why ?
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  const current = workInProgress.alternate;
  if (current !== null) {
    console.error("no implement in renderWithHooks");
  } else {
    currentDispatcher.current = HooksDispatchOnMount;
  }

  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;
  const children = Component(props);
  currentlyRenderingFiber = null;
  workInProgressHook = null;

  return children;
};

const HooksDispatchOnMount: Dispatcher = {
  useState: mountState,
};

function mountState<State>(
  initialState: (() => State) | State
): [State, Dispatch<State>] {
  const hook = mountWorkInprogressHook();
  let memoizedState: State;
  if (initialState instanceof Function) {
    memoizedState = initialState();
  } else {
    memoizedState = initialState;
  }
  hook.memoizedState = memoizedState;

  if (currentlyRenderingFiber === null) {
    console.error("currentlyRenderingFiber is null at mountState");
  }
  const queue = createUpdateQueue<State>();
  hook.updateQueue = queue;
  return [
    memoizedState,
    // @ts-ignore
    dispatchSetState.bind(null, currentlyRenderingFiber, queue),
  ];
}

function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State>
) {
  const update = createUpdate(action);
  enqueueUpdate(updateQueue, update);
  scheduleUpdateOnFiber(fiber);
}
function mountWorkInprogressHook(): Hook {
  // create a hook link list
  const hook: Hook = {
    memoizedState: null,
    updateQueue: null,
    next: null,
  };
  if (workInProgressHook === null) {
    if (currentlyRenderingFiber === null) {
      console.error("currentlyRenderingFiber is null ");
    } else {
      currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    }
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook as Hook;
}
