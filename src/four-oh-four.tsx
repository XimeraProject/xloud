import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from './tea';

export function update( _message : Message, state : State, _dispatch : Dispatcher ) : State {
  return state;
}

export function init( state : State, _dispatch : Dispatcher ) : State {
  return state;
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  return <div class={{container:true}}>    
    <h1>404</h1> 
    <p>I could not find your page.</p>
    <p>I am so sorry.</p>
    </div>;    
}

let FourOhFour : Component = { view, init, update };
export default FourOhFour;
