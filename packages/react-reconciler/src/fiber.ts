import { Key, Props, ReactElement, Ref } from "shared/ReactTypes";
import { Container } from "./hostConfig";
import { Flags, NoFlags } from "./fiberFlags";
import { UpdateQueue } from "./updateQueue";
import { FunctionComponent, HostComponent, WorkTag } from "./workTags";

export class FiberNode {
  pendingProps: Props;
  memoizedProps: Props | null;
  key: Key;
  stateNode: any;
  type: any;
  ref: Ref;
  tag: WorkTag;
  flags: Flags;
  subtreeFlags: Flags;

  return: FiberNode | null;
  sibling: FiberNode | null;
  child: FiberNode | null;
  index: number;

  updateQueue: unknown;

  memoizedState: any;

  alternate: FiberNode | null;

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    // instance
    this.tag = tag;
    this.key = key;
    this.stateNode = null;
    this.type = null;

    // tree
    this.return = null;
    this.sibling = null;
    this.child = null;
    this.index = 0;

    this.ref = null;

    // state
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;

    // effect
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    // this.deletions = null;

    // lanes
    // this.lanes = NoLanes;
    // this.childLanes = NoLanes;

    this.alternate = null;
  }
}

export class FiberRootNode {
  container: Container;
  current: FiberNode;
  finishedWork: FiberNode | null;
  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;
    this.finishedWork = null;
  }
}

export function createFiberFromElement(element: ReactElement): FiberNode {
  const { type, key, props } = element;
  let fiberTag: WorkTag = FunctionComponent;

  if (typeof type === "string") {
    fiberTag = HostComponent;
  }
  const fiber = new FiberNode(fiberTag, props, key);
  fiber.type = type;

  return fiber;
}

export const createWorkInProgress = (
  current: FiberNode,
  pendingProps: Props
): FiberNode => {
  let wip = current.alternate;
  // mount
  if (wip === null) {
    wip = new FiberNode(current.tag, pendingProps, current.key);
    wip.type = current.type;
    wip.stateNode = current.stateNode;
    wip.alternate = current;
    current.alternate = wip;
  } else {
    //update
    wip.pendingProps = pendingProps;
  }

  wip.updateQueue = current.updateQueue;
  wip.flags = current.flags;
  wip.child = current.child;

  // data
  wip.memoizedProps = current.memoizedProps;
  wip.memoizedState = current.memoizedState;

  return wip;
};
