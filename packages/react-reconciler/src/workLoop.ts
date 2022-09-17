import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { createWorkInProgress, FiberNode, FiberRootNode } from "./fiber";
import { HostRoot } from "./workTags";
import { commitMutationEffects } from "./commitWork";

import { MutationMask, NoFlags } from "./fiberFlags";

let workInProgress: FiberNode | null = null;

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  const root = markUpdateLaneFromFiberToRoot(fiber);

  if (root === null) {
    return;
  }
  ensureRootIsScheduled(root);
}

// find root
function markUpdateLaneFromFiberToRoot(fiber: FiberNode) {
  let node = fiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }
  if (node.tag === HostRoot) {
    return node.stateNode;
  }
  return null;
}

function ensureRootIsScheduled(root: FiberRootNode) {
  // schedule work
  performSyncWorkOnRoot(root);
}

function performSyncWorkOnRoot(root: FiberRootNode) {
  // initialize
  prepareFreshStack(root);
  // do render

  do {
    try {
      workLoop();
      break;
    } catch (e) {
      console.error("workLoop error");
      workInProgress = null;
    }
  } while (true);
  // commit phase
  if (workInProgress !== null) {
    console.error("render end, but wip is not null", root);
  }
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  commitRoot(root);
  console.log("render end", root);
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork;
  if (finishedWork === null) {
    return;
  }
  // reset
  root.finishedWork = null;
  const subtreeHasEffect =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  if (subtreeHasEffect || rootHasEffect) {
    // invoke the effect
    // phase1 before mutation
    // phase 2 mutation
    commitMutationEffects(finishedWork);
    // phase 3 layout
  } else {
    root.current = finishedWork;
  }
}

function prepareFreshStack(root: FiberRootNode) {
  workInProgress = createWorkInProgress(root.current, {});
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber);
  if (next === null) {
    completeUnitWork(fiber);
  } else {
    workInProgress = next;
  }
}

function completeUnitWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber;
  do {
    const next = completeWork(fiber);
    if (next !== null) {
      workInProgress = next;
      return;
    }
    const sibling = node.sibling;
    if (sibling) {
      workInProgress = next;
      return;
    }
    node = node.return;
    workInProgress = node;
  } while (node !== null);
}
