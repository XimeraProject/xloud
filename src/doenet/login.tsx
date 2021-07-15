import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

import { SetDoenetTokenMessage, DoenetDisconnectMessage } from '../message';
import { login, logout, getAccessToken } from "@doenet/cloud";
import { withDefaultPrevented } from '../helpers';

// FIXME: fetch ?error=access_denied and set a flash message

export function update( message : Message, state : State, _dispatch : Dispatcher ) : State {
  if (message.type ===  'set-doenet-token') {
    return {...state, doenetToken: message.token };
  }

  if (message.type ===  "doenet-disconnect") {
    logout();
    return {...state, doenetToken: undefined };
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
    return <li class={{"dropdown":true}}>
      <a class={{"nav-link":true, "dropdown-toggle":true}} attrs={{href: "#", id:"doenetDropdown", role: "button", "data-bs-toggle": "dropdown",  "aria-expanded": "false"}}>
      <Icon fa="user"/>&nbsp;Gradebook</a>
      <ul class={{"dropdown-menu":true}} attrs={{"aria-labelledby": "doenetDropdown"}}>
      <li><a class={{"dropdown-item":true}}
    on={{click: withDefaultPrevented(() => dispatch(new DoenetDisconnectMessage()))}}
     attrs={{href:"#"}}><Icon fa="sign-out-alt"/>&nbsp;Logout</a></li>      
      </ul>
      </li>;
  }

  return <li class={{"nav-item":true, "mb-auto": true, "mt-auto": true}}>
    <a class={{"btn": true, "btn-primary": true}} on={{click: withDefaultPrevented(() => login())}}>Log In</a>
        </li>;
}

let DoenetLoginButton : Component = { view, init, update };
export default DoenetLoginButton;
