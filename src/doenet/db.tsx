import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

import { SetDoenetDatabaseMessage, SetDoenetShadowMessage, DoenetSavingMessage } from '../message';
import { getState as getDoenetState, putState as putDoenetState } from "@doenet/cloud";

import { withDefaultPrevented } from '../helpers';
import { stateToPathname } from '../state';
import isDeepEqual from 'deep-equal';

export function putDatabase( state : State, dispatch : Dispatcher, db : any ) {
  console.log('puting',db);
  console.log(state);

  
  if (!state.doenetToken) {
    // FIXME: could flash a warning here since we COULD be saving but we aren't
    console.log('not logged in');
    return;
  }

  // FIXME this is wrong when there is a final hash
  const url = new URL(window.location.toString());
  url.pathname = stateToPathname(state);

  dispatch( new SetDoenetDatabaseMessage( db, url.pathname ) );
  
  return;
}

export async function saveDatabase( state : State, dispatch : Dispatcher ) {
  if (!state.doenetToken) {
    // FIXME: could flash a warning here since we COULD be saving but we aren't
    return;
  }

  if (state.repository && state.texFilename && state.databases && state.doenetToken) {
    const url = new URL(window.location.toString());
    const pathname = stateToPathname(state);
    url.pathname = pathname;

    let db = state.databases.get(pathname);
    if (db !== undefined)  {
      dispatch( new DoenetSavingMessage( url.pathname ) );
      
      const _result = await putDoenetState(db, url.toString());

      if (_result.ok) {
        dispatch( new SetDoenetShadowMessage( db, pathname ) );
      }
    }
  }
  
  // FIXME: should display errors here!
  
  return;
}

export async function clearDatabase( state : State, dispatch : Dispatcher ) {
  putDatabase( state, dispatch, {} );
  return saveDatabase( state, dispatch );
}

async function requestDatabase(state : State, dispatch : Dispatcher): Promise<void> {
  const url = new URL(window.location.toString());
  
  url.pathname = stateToPathname(state);

  const db = await getDoenetState(url.toString());

  dispatch( new SetDoenetDatabaseMessage( db, url.pathname ) );
  dispatch( new SetDoenetShadowMessage( db, url.pathname ) );
  
  return;
}

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  if (message.type === 'set-doenet-token') {
    return {...state,
            doenetToken: message.token};
  }

  if (message.type === 'set-repository') {
    if (state.repository && state.texFilename && state.doenetToken) {
      requestDatabase( state, dispatch );
    }
  }
  
  if (message.type === 'set-doenet-database') {
    let result = {...state};
      
    if (result.databases === undefined)
      result.databases = new Map();

    result.databases.set(message.pathname, JSON.parse(JSON.stringify(message.db)));
      
    return result;
  }

  if (message.type === 'patch-doenet-database') {
    let result = {...state};
      
    if (result.databases === undefined)
      result.databases = new Map();

    let db = {...state.databases?.get(message.pathname)};
    db[message.key] = message.value;
    
    result.databases.set(message.pathname, JSON.parse(JSON.stringify(db)));

    return result;
  }  

  if (message.type === 'doenet-saving') {
    let result = {...state};

    if (result.saving === undefined)
      result.saving = new Map();

    result.saving.set(message.pathname, true);
      
    return result;    
  }
  
  if (message.type === 'set-doenet-shadow') {
    let result = {...state};
      
    if (result.shadows === undefined)
      result.shadows = new Map();

    result.shadows.set(message.pathname, JSON.parse(JSON.stringify(message.db)));

    if (result.saving === undefined)
      result.saving = new Map();

    result.saving.set(message.pathname, false);
      
    return result;
  }  
  
  return state;
}

export function init( state : State, dispatch : Dispatcher ) : State {
  return state;
}

function ResponsiveHide( { long } ): VNode {
  return <span><span class={{"d-none":true, "d-lg-inline":true}}>&nbsp; { long }</span></span>;
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  if (state.repository && state.texFilename && state.databases && state.doenetToken) {
    let buttons : VNode[] = [];
    
    let isSaved = false;
    const pathname = stateToPathname(state);
    let database = state.databases.get(pathname);

    if (state.shadows) {
      let shadow = state.shadows.get(pathname);
      isSaved = isDeepEqual(database, shadow);
    }

    const isSaving = state.saving?.get(pathname);
    
    if (isSaved) {
      buttons.push( <li class={{"nav-item":true, "me-1": true, "mb-auto": true, "mt-auto": true}}>
                    <a class={{"btn": true, "disabled": true, "btn-primary": true}}><Icon fa="save"/><ResponsiveHide long={"Saved"}/></a>
                    </li>);
    } else {
      if (isSaving) {
        buttons.push( <li class={{"nav-item":true, "me-1": true, "mb-auto": true, "mt-auto": true}}>
                      <a class={{"btn": true, "disabled": true, "btn-primary": true}}>
                      <span class={{"spinner-border": true, "spinner-border-sm":true}} attrs={{"role": "status", "aria-hidden": "true"}}></span>
                      <ResponsiveHide long={"Saving…"}/></a>
                      </li>);
      } else {
        buttons.push( <li class={{"nav-item":true, "me-1": true, "mb-auto": true, "mt-auto": true}}>
                      <a class={{"pulse": true, "btn": true, "btn-primary": true}} on={{click: withDefaultPrevented(() => saveDatabase(state, dispatch))}}><Icon fa="save"/><ResponsiveHide long={"Save"}/></a>
                      </li>);
      }
    }

    let eraseDisabled = (database === null) || isDeepEqual(database, {});
    
    buttons.push( <li class={{"nav-item":true, "me-1": true, "mb-auto": true, "mt-auto": true}}>
                  <a class={{"btn": true, disabled: eraseDisabled, "btn-danger": true}} on={{click: withDefaultPrevented(() => clearDatabase(state, dispatch))}}><Icon fa="eraser"/><ResponsiveHide long={"Erase"} /></a>
                    </li>);    
    
    return <div class={{"navbar-nav": true}}>{buttons}</div>;
  }
  
  return <div></div>;
}

export let DoenetDatabase : Component = { view, init, update };
export default DoenetDatabase;
