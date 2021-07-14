import { jsx, VNode } from "snabbdom";
import logo from '../public/logo/logo.svg';
import { Message, State, Dispatcher, Component } from './tea';
import Icon from './icon';

import Link from './link';
import doenet from './doenet';
const Doenet = doenet.view;

const brandStyle = { maxHeight: "1rem", opacity: "0.5", verticalAlign: "baseline"};
function Brand() { return <img attrs={{src: logo}} style={brandStyle}/>; }

export function init( state : State, dispatch : Dispatcher ) : State {
  return {...state,
          ...doenet.init( state, dispatch )
         };
}

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  return doenet.update( message, state, dispatch );
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
    <span class={{"navbar-toggler-icon":true}}></span>
    </button>
    <div class={{collapse:true, "navbar-collapse":true}} attrs={{id: "navbarNav"}}>
    <ul class={{"navbar-nav":true}}>
    <li class={{"nav-item":true}}>
    <Link class={{"nav-link":true}} dispatch={dispatch} href={"/help"}>Help</Link>
    </li>
    { buttons }
    </ul>
    <ul class={{"navbar-nav":true, "ms-auto":true}}>  
    <Doenet dispatch={dispatch} state={state}/>
    </ul>
    </div>
    </div>
    </nav>;
}

let Navbar : Component = { view, init, update };
export default Navbar;
