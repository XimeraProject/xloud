import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from './tea';
import Icon from './icon';

import Link from './link';

import doenetLogin from './doenet/login';
const DoenetLogin = doenetLogin.view;

import { view as GetHelp } from './get-help';

import { DoenetScore as doenetScore } from './doenet/score';
const DoenetScore = doenetScore.view;

import Brand from './brand';

export function init( state : State, dispatch : Dispatcher ) : State {
  return {...state,
          ...doenetLogin.init( state, dispatch ),
          ...doenetScore.init( state, dispatch )
         };
}

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  return doenetLogin.update( message,
                             doenetScore.update( message, state, dispatch ),
                             dispatch );
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  let buttons : VNode[] = [];

  if (state.owner && state.repo && state.branch) {
    let editHref = `https://github.com/${state.owner}/${state.repo}/edit/${state.branch}/${state.texFilename}`;
    let b = <li class={{"nav-item":true}}>
        <a class={{"btn": true, "btn-outline-secondary": true, "nav-link":true}} attrs={{href:editHref}}><Icon fa="pencil-alt"/>&nbsp;Edit</a>
        </li>;
    buttons.push(b);
  }

  return <nav class={{navbar:true, "fixed-top":true, "navbar-expand-md":true, "navbar-light":true, "bg-light": true}}>
    <div class={{"container-fluid": true}}>
    <Link class={{"navbar-brand":true}} dispatch={dispatch} href={"/"}><Brand/></Link>
    <button class={{"navbar-toggler":true, "ms-auto": true}} attrs={{"data-bs-toggle": "collapse", "data-bs-target": "#navbarNav", type: "button", "aria-controls": "navbarNav", "aria-expanded": "false", "aria-label": "Toggle navigation"}}>
    <Icon fa="bars"/>
    </button>
    <div class={{collapse:true, "navbar-collapse":true}} attrs={{id: "navbarNav"}}>
    <ul class={{"navbar-nav":true}}>
    <li class={{"nav-item":true}}>
    <GetHelp dispatch={dispatch} state={state}/>
    </li>
  </ul>
    <div class={{"ms-auto":true, "navbar-nav":true}}>
    { buttons }    
    <DoenetScore dispatch={dispatch} state={state}/>      
    <ul class={{"navbar-nav":true}}>
    <DoenetLogin dispatch={dispatch} state={state}/>
    </ul>
    </div>
    </div>
    </div>
    </nav>;
}

let Navbar : Component = { view, init, update };
export default Navbar;
