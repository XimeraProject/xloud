import { jsx, VNode } from "snabbdom";

import Worker from "./tex.worker";
let texWorker = new Worker();

import { render } from './dvi';

import { Message, State, Dispatcher, Component } from './tea';
import { TerminalLogMessage, SetDviMessage, ErrorMessage } from './message';

import { stateToPathname } from './state';

import { updateRepository, requestRepository } from './github';

import { BackgroundProcess } from './background-process';

function debounce(func, wait : number) {
  var timeout : number | undefined;
  return function(): void {
    function later() {
      timeout = undefined;
      func();
    }
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
};

function appropriateHsize() {
  let fullWidth = (document.body.clientWidth * 72 / 96);
  if (fullWidth > 6.5 * 72)
    return 6.5 * 72;

  // some whitespace even on small screens
  fullWidth = fullWidth - 30;
  
  return fullWidth;
}

function recompile() {
  let hsize = appropriateHsize();
  texWorker.postMessage({ hsize,
                          firstTime: false
                        });
}

(window as any).recompile = recompile;

const debouncedRecompile = debounce( recompile, 500 );

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  let newState = {...state,
                  ...updateRepository( message, state, dispatch )};

  if (message.type === 'set-repository') {
    if (newState.repository && newState.texFilename) {
      let url = newState.repository.url( newState.texFilename );
      let hsize = appropriateHsize();  

      texWorker.postMessage({ url,
                              hsize,
                              firstTime: true
                            });
      
      return {...newState,
              backgroundProcess: new BackgroundProcess('Running jsTeX', 30),
             };
    }
  }  
  
  if (message.type === 'window-resize') {
    debouncedRecompile();
    return newState;
  }
  
  if (message.type === 'terminal-log') {
    if (state.terminal) {
      return {...newState, terminal: state.terminal + message.text };
    } else {
      return {...newState, terminal: message.text };      
    }
  }

  if (message.type === 'set-dvi') {
    let result = {...newState,
                  backgroundProcess: undefined,
                  dvi: message.dvi,
                  hsize: message.hsize };

    return result;
  }

  return newState;
}

export function init( state : State, dispatch ) : State {
  let params = state.routeParams;

  requestRepository( params.owner, params.repo, dispatch );

  texWorker.onmessage = function (event) {
    if (event.data.error) {
      dispatch(new ErrorMessage(event.data.error));
    } else {
      if (event.data.text) {
        dispatch( new TerminalLogMessage(event.data.text) );
      }
    
      if (event.data.dvi) {
        dispatch( new SetDviMessage(event.data.dvi,
                                    event.data.hsize) );
      }
    }
  };
  
  return {...state,
          backgroundProcess: new BackgroundProcess('Fetching repository'),
          repository: undefined,
          dvi: undefined,
          terminal: undefined,
          texFilename: `${params.filename}.tex`,
          viewingSource: false
         };
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  if (state.dvi && state.hsize) {
    console.log('state.dvi=',state.dvi);
    if (state.dvi.byteLength != 0) {
      let rendered = render(state.dvi);
      let fullWidth = (document.body.clientWidth * 72 / 96);
      let paddingLeft = (fullWidth - state.hsize) / 2.0;
      return <div style={{"margin-right": "0in",
                          "margin-left":"0in",
                          "margin-top":"0.25in",
                          "padding-left": `${paddingLeft}pt`,
                          "margin-bottom": "0.5in"}} class={{container:true}}>{ rendered }</div>;
    }
  }

  if (state.terminal) {
    if (state.terminal.length > 0) {
      let lines = state.terminal.toString().split("\n").filter( (line) => line !== '' );
      let wrapped = lines.map( (line) => <pre>{ line }</pre> );
      return <div class={{container:true, terminal:true}}>{ wrapped }</div>;
    }
  }

  if (state.backgroundProcess)
    return <div></div>;
  
  return <div class={{container:true}}><p>Could not load DVI.</p></div>;
}

let Page : Component = { view, init, update };
export default Page;
