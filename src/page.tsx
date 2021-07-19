import { jsx, VNode } from "snabbdom";
import { view as Spinner } from './spinner';

import Worker from "./tex.worker";
let texWorker = new Worker();

import { render } from './dvi';

import { Message, State, Dispatcher, Component } from './tea';
import { TerminalLogMessage, SetDviMessage } from './message';

import { stateToPathname } from './state';

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

function recompile() {
  let hsize = (document.body.clientWidth * 72 / 96) - 72*2;
  console.log('recompiling with hsize=',hsize);
  texWorker.postMessage({ hsize,
                          firstTime: false
                        });
}

(window as any).recompile = recompile;

const debouncedRecompile = debounce( recompile, 500 );

export function update( message : Message, state : State, dispatch ) {
  if (message.type === 'window-resize') {
    debouncedRecompile();
    return state;
  }
  
  if (message.type === 'terminal-log') {
    return {...state, terminal: state.terminal + message.text };
  }

  if (message.type === 'set-dvi') {
    let result = {...state, loading: false, dvi: message.dvi,
                  terminal: ''};

    /*
    if (result.dvi === undefined)
      result.dvi = new Map();

    result.dvi.set(message.pathname, message.dvi);
    */

    console.log('SET DVI');
    console.log(result);
    return result;
  }

  return state;
}

export function init( state : State, dispatch ) : State {
  let params = state.routeParams;
  let url = `/github/${params.owner}/${params.repo}/${params.filename}.tex`;
  let newState = {...state,
                  owner: params.owner,
                  repo: params.repo,
                  texFilename: `${params.filename}.tex`,
                  loading: url,
                  terminal: '',
                  viewingSource: false
                 };
  
  texWorker.onmessage = function (event) {
    if (event.data.text) {
      dispatch( new TerminalLogMessage(event.data.text) );
    }
    
    if (event.data.dvi) {
      console.log(event.data.dvi);
      dispatch( new SetDviMessage(event.data.dvi,
                                  stateToPathname(newState)) );
    }
  };

  texWorker.postMessage({ url,
                          hsize: (document.body.clientWidth * 72 / 96) - 72*2,
                          firstTime: true
                        });
  
  return newState;
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  if (state.dvi) {
    /*const dvi = state.dvi.get(stateToPathname(state));
    console.log(dvi);*/
    //if (dvi) {
    let rendered = render(state.dvi);
    return <div style={{"margin-top":"0.25in", "margin-bottom": "0.5in"}} class={{container:true}}>{ rendered }</div>;
    //    }
  }

  
  if (state.terminal) {
    if (state.terminal.length > 0) {
      let lines = state.terminal.toString().split("\n").filter( (line) => line !== '' );
      let wrapped = lines.map( (line) => <pre>{ line }</pre> );
      return <div class={{container:true, terminal:true}}>{ wrapped }</div>;
    }
  }
  
  if (state.loading)
    return <Spinner state={state} dispatch={dispatch}/>;

  return  <div class={{container:true}}>    
    <p>Could not load DVI.</p>
    </div>;
}

let Page : Component = { view, init, update };
export default Page;
