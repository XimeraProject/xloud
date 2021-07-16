import { jsx, VNode } from "snabbdom";
import { view as Spinner } from './spinner';

import Worker from "./tex.worker";
let texWorker = new Worker();

import { render } from './dvi';

import { Message, State, Dispatcher, Component } from './tea';
import { TerminalLogMessage } from './message';
import State from './state';

export function update( message : Message, state : State, dispatch ) {
  if (message.type === 'terminal-log') {
    return {...state, terminal: state.terminal + message.text };
  }

  /*
  if (message[0] === 'render-dvi') {
    return {...state, loading: false, terminal: '', dvi: message[1] };
  }
  */
      
  return state;
}

export function init( state : State, dispatch ) : State {
  let params = state.routeParams;
  let url = `/github/${params.owner}/${params.repo}/${params.filename}.tex`;
  
  texWorker.onmessage = function (event) {
    if (event.data.text) {
      dispatch( new TerminalLogMessage(event.data.text) );
    }
    
    if (event.data.dvi) {
      dispatch( ['render-dvi', event.data.dvi] );      
    }
  };

  texWorker.postMessage({ url,
                          hsize: (document.body.clientWidth * 72 / 96) - 72*2
                        });
  
  return {...state,
          owner: params.owner,
          repo: params.repo,
          texFilename: `${params.filename}.tex`,
          loading: url,
          terminal: '',
         };
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  if (state.dvi) {
    let rendered = render(state.dvi);
    return <div class={{container:true}}>{ rendered }</div>;    
  }
  
  if (state.terminal.length > 0) {
    let lines = state.terminal.toString().split("\n").filter( (line) => line !== '' );
    let wrapped = lines.map( (line) => <pre>{ line }</pre> );
    return <div class={{container:true, terminal:true}}>{ wrapped }</div>;
  }
  
  if (state.loading)
    return <Spinner state={state} dispatch={dispatch}/>;

  return  <div class={{container:true}}>    
    <p>Could not load code.</p>
    </div>;
}


let Page : Component = { view, init, update };
export default Page;
