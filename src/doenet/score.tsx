import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

import { SetDoenetScoreMessage, DoenetDisconnectMessage } from '../message';
import { getScore as getDoenetScore, putScore as putDoenetScore } from "@doenet/cloud";
import { stateToPathname } from '../state';

export async function putScore( state : State, dispatch : Dispatcher, score : number ) {
  if (!state.doenetToken) {
    // FIXME: could flash a warning here since we COULD be saving the score but we aren't
    return;
  }
  
  const url = new URL(window.location.toString());
  
  url.pathname = stateToPathname(state);

  const _result = await putDoenetScore(score, url.toString());

  if (_result.ok) {
    dispatch( new SetDoenetScoreMessage( score, url.pathname ) );    
  }

  // FIXME: should display errors here
  
  return;
}

async function requestScore(state : State, dispatch : Dispatcher): Promise<void> {
  const url = new URL(window.location.toString());

  (window as any).putTheScore = async function(s) {
    putScore(state, dispatch, s);
  };
  
  url.pathname = stateToPathname(state);

  const score = await getDoenetScore(url.toString());

  if (score === null)
    dispatch( new SetDoenetScoreMessage( 0, url.pathname ) );
  else
    dispatch( new SetDoenetScoreMessage( score, url.pathname ) );
  
  return;
}

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  if (message.type === 'set-doenet-token') {
    if (state.repository && state.texFilename) {
      requestScore( state, dispatch );
    }
  }

  if (message.type === 'navigate-to') {
    if (state.repository && state.texFilename && state.doenetToken) {
      requestScore( state, dispatch );
    }
  }
  
  if (message.type === 'set-doenet-score') {
    if (message.pathname === stateToPathname(state)) {
      let result = {...state};
      if (result.scores === undefined)
        result.scores = new Map();

      result.scores.set(message.pathname, message.score);
      
      return result;
    }
  }
  
  return state;
}

export function init( state : State, dispatch : Dispatcher ) : State {
  return state;
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  if (state.repository && state.texFilename && state.scores && state.doenetToken)  {
    if (state.scores) {
      let pathname = stateToPathname(state);
      
      if (state.scores.has(pathname)) {
        let score = state.scores.get(pathname);
        if (score !== undefined) {
          return <div style={{width:"1in"}} class={{progress:true, "mr-1": true, "ms-2": true, "mt-auto": true, "mb-auto": true}}
          attrs={{"data-toggle":"tooltip", "data-placement": "bottom", title: `${Math.floor(score * 100.0)}%`}}>
            <div style={{"width": `${score * 100.0}%`}} class={{"progress-bar":true, "bg-success":true}}
          attrs={{role: "progressbar", "aria-valuenow": `${Math.floor(score * 100.0)}`, "aria-valuemin": "0", "aria-valuemax": "100"}}></div>
            </div>;
        }
      }
    }
  }

  return <div></div>;
}

export let DoenetScore : Component = { view, init, update };
export default DoenetScore;
