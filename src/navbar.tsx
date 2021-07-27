import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from './tea';
import Icon from './icon';

import Link from './link';

import doenetLogin from './doenet/login';
const DoenetLogin = doenetLogin.view;

import { view as GetHelp } from './get-help';

import { DoenetScore as doenetScore } from './doenet/score';
const DoenetScore = doenetScore.view;

import { DoenetDatabase as doenetDatabase } from './doenet/db';
const DoenetDatabase = doenetDatabase.view;

import Brand from './brand';

export function init( state : State, dispatch : Dispatcher ) : State {
  return {...state,
          ...doenetLogin.init( state, dispatch ),
          ...doenetScore.init( state, dispatch ),
          ...doenetDatabase.init( state, dispatch )          
         };
}

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  return doenetLogin.update( message,
                             doenetDatabase.update( message,
                                                    doenetScore.update( message, state, dispatch ),
                                                    dispatch ),
                             dispatch );
}

function ResponsiveHide( { long } ): VNode {
  return <span><span class={{"d-none":true, "d-lg-inline":true}}>&nbsp; { long }</span></span>;
}


export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  let buttons : VNode[] = [];

  if (state.repository && state.texFilename) {
    let editHref = state.repository.editLink(state.texFilename);
    let b = <li class={{"nav-item":true, "me-1": true, "mb-auto": true, "mt-auto": true}}>
        <a class={{"btn": true, "btn-outline-secondary": true}} attrs={{href:editHref}} title="Edit on GitHub"><Icon fa="pencil-alt"/><ResponsiveHide long={"Edit"}/></a>
        </li>;
    buttons.push(b);
  }

  if (state.repository && state.texFilename && (state.viewingSource === true)) {
    let viewDvi = `/${state.repository.owner}/${state.repository.name}/${state.texFilename.replace(/.tex$/,'')}`;
    let b = <li class={{"nav-item":true, "me-1": true, "mb-auto": true, "mt-auto": true}}>
        <Link class={{"btn": true, "btn-outline-secondary": true}} dispatch={dispatch} href={viewDvi}><Icon fa="book-reader"/><ResponsiveHide long={"Rendered"}/></Link>
        </li>;
    buttons.push(b);
  }
  
  
  if (state.repository && state.texFilename && (state.viewingSource === false)) {
    let viewSource = `/${state.repository.owner}/${state.repository.name}/${state.texFilename}`;
    let b = <li class={{"nav-item":true, "me-1": true, "mb-auto": true, "mt-auto": true}}>
        <Link class={{"btn": true, "btn-outline-secondary": true}} dispatch={dispatch} href={viewSource}><Icon fa="code"/><ResponsiveHide long={"Source"}/></Link>
        </li>;
    buttons.push(b);
  }

  if (state.viewingSource === false) {
    buttons.unshift( <DoenetDatabase dispatch={dispatch} state={state} /> );
    buttons.push( <DoenetScore dispatch={dispatch} state={state}/> );
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
    <ul class={{"ms-auto":true, "navbar-nav":true}}>      
    { buttons }
    <DoenetLogin dispatch={dispatch} state={state}/>
    </ul>
    </div>
    </div>
    </nav>;
}

let Navbar : Component = { view, init, update };
export default Navbar;
