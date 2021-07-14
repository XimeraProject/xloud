import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from './tea';
import Icon from './icon';

import { SetDoenetTokenMessage } from './message';
import { login, logout, getAccessToken } from "@doenet/cloud";

// FIXME: fetch ?error=access_denied and set a flash message

export function update( message : Message, state : State, _dispatch : Dispatcher ) : State {
  if (message.type ===  'set-doenet-token') {
    return {...state, doenetToken: message.token };
  }
  
  return state;
}

export function init( state : State, dispatch : Dispatcher ) : State {
  (async function() {
    let token = await getAccessToken();
    if (token) {
      dispatch( new SetDoenetTokenMessage( token ) );
    }
  })();
  
  return state;
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  if (state.doenetToken) {
    return <li class={{"nav-item":true, "dropdown":true}}>
      <a class={{"nav-link":true, "dropdown-toggle":true}} attrs={{href: "#", id:"doenetDropdown", role: "button", "data-bs-toggle": "dropdown",  "aria-expanded": "false"}}>
      <Icon fa="user"/>&nbsp;Gradebook</a>
      <ul class={{"dropdown-menu":true}} attrs={{"aria-labelledby": "doenetDropdown"}}>
      <li><a class={{"dropdown-item":true}} attrs={{href:"#"}}><Icon fa="sign-out-alt"/>&nbsp;Logout</a></li>      
      </ul>
      </li>;
  }

  return <li class={{"nav-item":true}}>
        <a class={{"btn": true, "btn-outline-secondary": true, "nav-link":true}} on={{click: () => login()}}>Log In</a>
        </li>;
}

let DoenetLoginButton : Component = { view, init, update };
export default DoenetLoginButton;
