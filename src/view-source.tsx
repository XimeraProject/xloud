import { jsx, VNode } from "snabbdom";
import { view as Spinner } from './spinner';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-latex';
import 'prismjs/themes/prism.css';

import { Message, State, Dispatcher, Component } from './tea';
import { ErrorMessage, ViewSourceMessage } from './message';

import { updateRepository, requestRepository } from './github';

import { BackgroundProcess } from './background-process';

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  let newState = {...state,
                  ...updateRepository( message, state, dispatch )};
  
  if (message.type === 'set-repository') {
    if (newState.repository && newState.texFilename) {
      let url = newState.repository.url( newState.texFilename );

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.text();
        })
        .then(data => dispatch( new ViewSourceMessage(url, data) ))
        .catch((error) => {
          dispatch( new ErrorMessage(error.toString()) );
        });

      return {...newState,
              backgroundProcess: new BackgroundProcess('Downloading file'),
             };
    }
  }
  
  if (message.type === 'view-source') {
    return {...newState, backgroundProcess: undefined, source: message.source };
  }
      
  return newState;
}

export function init( state : State , dispatch : Dispatcher ) : State {
  let params = state.routeParams;

  requestRepository( params.owner, params.repo, dispatch );
  
  return {...state,
          backgroundProcess: new BackgroundProcess('Fetching repository'),
          repository: undefined,
          texFilename: `${params.filename}.tex`,
          viewingSource: true,
         };
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
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

let ViewSource : Component = { view, init, update };
export default ViewSource;


