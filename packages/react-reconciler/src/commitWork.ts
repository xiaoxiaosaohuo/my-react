import { FiberNode, FiberRootNode } from "./fiber";
import { MutationMask, NoFlags, Placement } from "./fiberFlags";
import { appendChildToContainer, Container } from "./hostConfig";
import { HostComponent, HostRoot, HostText } from "./workTags";

let nextEffect: FiberNode | null = null;

export const commitMutationEffects = (finishedWork: FiberNode) => {
  nextEffect = finishedWork;
  while (nextEffect != null) {
    // goes down
    const child: FiberNode | null = nextEffect.child;
    if (
      (nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
      child !== null
    ) {
      nextEffect = child;
    } else {
      up: while (nextEffect != null) {
        commitMutationEffectsOnFiber(nextEffect);
        const sibling: FiberNode | null = nextEffect.sibling;
        if (sibling !== null) {
          nextEffect = sibling;
          break up;
        }
        nextEffect = nextEffect.return;
      }
    }
  }
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
  const flags = finishedWork.flags;
  if ((flags & Placement) !== NoFlags) {
    // insert placement
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
};

const commitPlacement = (finishedWork: FiberNode) => {
  const hostParent = getHostParent(finishedWork) as FiberNode;
  let parentStateNode;
  switch (hostParent.tag) {
    case HostRoot:
      parentStateNode = (hostParent.stateNode as FiberNode).container;
      break;
    case HostComponent:
      parentStateNode = hostParent.stateNode;
  }
  appendChildToContainer(finishedWork.stateNode, parentStateNode);
};

function appendPlacementNodeIntoContainer(fiber: FiberNode, parent: Container) {
  if (fiber.tag === HostComponent || fiber.tag === HostText) {
    appendChildToContainer(fiber.stateNode, parent);
    return;
  }
  const child = fiber.child;
  if (child !== null) {
    appendPlacementNodeIntoContainer(child, parent);
    let sibling = child.sibling;

    while (sibling !== null) {
      appendPlacementNodeIntoContainer(sibling, parent);
      sibling = sibling.sibling;
    }
  }
}

function getHostParent(fiber: FiberNode) {
  let parent = fiber.return;
  while (parent) {
    const parentTag = parent.tag;
    if (parentTag === HostComponent || parentTag === HostRoot) {
      return parent;
    }
    parent = parent.return;
  }
  console.error("getHostParent error");
}
