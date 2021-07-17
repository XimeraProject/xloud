import { jsx, VNode } from "snabbdom";
import { view as Spinner } from './spinner';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-latex';
import 'prismjs/themes/prism.css';

import { Message, State, Dispatcher, Component } from './tea';
import { ErrorMessage, ViewSourceMessage } from './message';

import { updateRepositoryDetails, requestRepositoryDetails } from './github';

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  if (message.type === 'view-source') {
    if (message.url === state.loading) {
      return {...state, loading: undefined, source: message.source };
    }
  }
      
  return {...state,
          ...updateRepositoryDetails( message, state, dispatch )};
}

export function init( state : State , dispatch : Dispatcher ) : State {
  let params = state.routeParams;
  let url = `/github/${params.owner}/${params.repo}/${params.filename}.tex`;

  requestRepositoryDetails( params.owner, params.repo, dispatch );
  
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

  return {...state,
          owner: params.owner,
          repo: params.repo,
          texFilename: `${params.filename}.tex`,
          loading: url,
          viewingSource: true,
         };
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
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

let ViewSource : Component = { view, init, update };
export default ViewSource;


