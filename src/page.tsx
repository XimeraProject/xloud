import { jsx, VNode } from "snabbdom";

import Worker from "./tex.worker";
let texWorker = new Worker();

import { render } from './dvi';

import { Message, State, Dispatcher, Component } from './tea';
import { TerminalLogMessage, SetDviMessage } from './message';

import { stateToPathname } from './state';

import { updateRepository, requestRepository } from './github';

import { BackgroundProcess, BackgroundProcessComponent } from './background-process';
const backgroundProcessView = BackgroundProcessComponent.view;
const backgroundProcessUpdate = BackgroundProcessComponent.update;


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

export function update( message : Message, state : State, dispatch ) {
  let newState = {...state,
                  ...backgroundProcessUpdate( message, state, dispatch ),
                  ...updateRepository( message, state, dispatch )};

  if (message.type === 'set-repository') {
    if (newState.repository) {
      let url = newState.repository.url( `${state.texFilename}.tex` );
      let hsize = appropriateHsize();  

      texWorker.postMessage({ url,
                              hsize,
                              firstTime: true
                            });
      return {...newState,
              backgroundProcess: new BackgroundProcess('Initial compile'),
             };
    }
  }  
  
  if (message.type === 'window-resize') {
    debouncedRecompile();
    return newState;
  }
  
  if (message.type === 'terminal-log') {
    return {...newState, terminal: state.terminal + message.text };
  }

  if (message.type === 'set-dvi') {
    let result = {...newState, loading: false,
                  dvi: message.dvi,
                  hsize: message.hsize };
                  //terminal: ''};

    return result;
  }

  return newState;
}

export function init( state : State, dispatch ) : State {
  let params = state.routeParams;

  /*
  let newState = {...state,
                  owner: params.owner,
                  repo: params.repo,
                  texFilename: `${params.filename}.tex`,
                  loading: url,
                  terminal: '',
                  viewingSource: false,
                 };*/

  requestRepository( params.owner, params.repo, dispatch );

  texWorker.onmessage = function (event) {
    if (event.data.text) {
      dispatch( new TerminalLogMessage(event.data.text) );
    }
    
    if (event.data.dvi) {
      console.log(event.data.dvi);
      dispatch( new SetDviMessage(event.data.dvi,
                                  event.data.hsize) );
    }
  };
  
  return {...state,
          backgroundProcess: new BackgroundProcess('Fetching repository'),
          repository: undefined,
          texFilename: `${params.filename}.tex`,
          viewingSource: false,
         };
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  if (state.backgroundProcess)
    return backgroundProcessView( {state, dispatch} );
  
  if (state.dvi && state.hsize) {
    /*const dvi = state.dvi.get(stateToPathname(state));
    console.log(dvi);*/
    //if (dvi) {
    let rendered = render(state.dvi);
    let fullWidth = (document.body.clientWidth * 72 / 96);        
    let paddingLeft = (fullWidth - state.hsize) / 2.0;
    return <div style={{"margin-right": "0in",
                        "margin-left":"0in",
                        "margin-top":"0.25in",
                        "padding-left": `${paddingLeft}pt`,
                        "margin-bottom": "0.5in"}} class={{container:true}}>{ rendered }</div>;
  }

  
  if (state.terminal) {
    if (state.terminal.length > 0) {
      let lines = state.terminal.toString().split("\n").filter( (line) => line !== '' );
      let wrapped = lines.map( (line) => <pre>{ line }</pre> );
      return <div class={{container:true, terminal:true}}>{ wrapped }</div>;
    }
  }
  

  return  <div class={{container:true}}>    
    <p>Could not load DVI.</p>
    </div>;
}

let Page : Component = { view, init, update };
export default Page;
