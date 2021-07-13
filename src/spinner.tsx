import './spinner.css';
import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component, Viewer, emptyInit, emptyUpdate } from './tea';

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  return <div class={{spinner:true}}>Loading...</div>;
}

const Spinner : Component = { view, init: emptyInit, update: emptyUpdate };
export default Spinner;
