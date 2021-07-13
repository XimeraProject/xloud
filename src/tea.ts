import { Message } from './message';
import State from './state';
import { VNode } from "snabbdom";
    
export type Dispatcher = (message: Message) => void;

export type Updater = (message: Message, state: State, dispatch: Dispatcher) => State;

export type Initer = (state : State, dispatch : Dispatcher) => State;

export type Viewer = ({state, dispatch}: { state : State, dispatch : Dispatcher }) => VNode;

export interface Component {
  view({state, dispatch}: { state : State, dispatch : Dispatcher }) : VNode;
  init(state : State, dispatch : Dispatcher) : State;
  update(message: Message, state: State, dispatch: Dispatcher) : State;
}

export function emptyInit(state : State, _dispatch : Dispatcher) : State {
  return state;
}

export function emptyUpdate(_message: Message, state: State, _dispatch: Dispatcher) : State {
  return state;
}

export { Message, State };
