import { ReactElement } from "shared/ReactTypes";
import { mountChildFibers, reconcileChildFibers } from "./childFiber";
import { FiberNode } from "./fiber";
import { processUpdateQueue } from "./updateQueue";
import { HostComponent, HostRoot } from "./workTags";

/**
 * 1. create fiberNode based on workTags
 * 2. return child FiberNode
 *
 */

export const beginWork = (workInProgress: FiberNode) => {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(workInProgress);
    case HostComponent:
      return updateHostComponent(workInProgress);
    default:
      console.error("not implement in beginWork");
      return null;
  }
};

function updateHostRoot(workInProgress: FiberNode) {
  processUpdateQueue(workInProgress);
  // store children in memoizedState, if this is a hostRoot
  const nextChildren = workInProgress.memoizedState;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}
function updateHostComponent(workInProgress: FiberNode) {
  const nextProps = workInProgress.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

function reconcileChildren(workInProgress: FiberNode, children?: ReactElement) {
  const current = workInProgress.alternate;

  if (current !== null) {
    // update
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      children
    );
  } else {
    // mount
    workInProgress.child = mountChildFibers(workInProgress, null, children);
  }
}
