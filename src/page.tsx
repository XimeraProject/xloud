import { jsx } from "snabbdom";
import { view as Spinner } from './spinner';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-latex';
import 'prismjs/themes/prism.css';

import Worker from "./tex.worker";
let texWorker = new Worker();

import { render } from './dvi';

import { Message } from './message';
import State from './state';

export function update( message : Message, state : State, dispatch ) {
  /*
  if (message[0] === 'view-source') {
    if (message[1] === state.loading) {
      return {...state, loading: false, source: message[2] };
    }
  }

  if (message[0] === 'terminal-log') {
    return {...state, terminal: state.terminal + message[1] };
  }

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
      dispatch( ['terminal-log', event.data.text] );
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

export function view( {state, dispatch} ) {
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

  if (state.source) {
    const html = Prism.highlight(state.source, Prism.languages.latex, 'latex');

    return <div class={{container:true}}>    
      <pre><code props={{innerHTML: html}}></code></pre>
      </div>;
  }
  
  return  <div class={{container:true}}>    
    <p>Could not load code.</p>
    </div>;
}
  
export default { view, init, update };
