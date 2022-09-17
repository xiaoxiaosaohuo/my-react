import { FiberNode } from "./fiber";
import { NoFlags } from "./fiberFlags";
import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  Instance,
} from "./hostConfig";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./workTags";
const appendAllChildren = (parent: Instance, workInProgress: FiberNode) => {
  // traverse workInProgress children, append them to parent;
  //   along one branch, go to the leaf node, if this node is hostComponent, append it to parent
  //  then go to it's sibling, do the same thing
  // in completeWork, we can guarantee the parent is a dom node

  let node = workInProgress.child;
  while (node != null) {
    // handle traverse, until node is null
    if (node.tag === HostComponent || node.tag === HostText) {
      // mount
      appendInitialChild(parent, node.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === workInProgress) {
      return;
    }

    // handle sibling, if sibling is null, return to parent, then it can go to parent level siblings
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
};

//  this works on the same node level
const bubbleProperties = (completeWork: FiberNode) => {
  let subtreeFlags = NoFlags;
  let child = completeWork.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child.return = completeWork;
    child = child.sibling;
  }
  completeWork.subtreeFlags |= subtreeFlags;
};

export const completeWork = (workInProgress: FiberNode) => {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case HostComponent:
      // initial DOM
      const instance = createInstance(workInProgress.type);
      // append DOM
      appendAllChildren(instance, workInProgress);

      workInProgress.stateNode = instance;

      // props

      // flag

      bubbleProperties(workInProgress);
      return null;
    case HostRoot:
      bubbleProperties(workInProgress);
      return null;
    case HostText:
      const textInstance = createTextInstance(newProps.content);
      workInProgress.stateNode = textInstance;
      // bubble flag
      bubbleProperties(workInProgress);
      return null;
    case FunctionComponent:
      bubbleProperties(workInProgress);
      return null;
    default:
      console.error("not implement in completeWork");
      return null;
  }
};
