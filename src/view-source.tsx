import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';

export function update( message, state ) {
  if (message[0] === 'set-source')
    return [ { ...state, source: message[1], loading: false },
             Cmd.none ];

  if (message[0] === 'show-error')
    return [ { ...state, error: message[1] },
             Cmd.none ];  
  
  return [ state, Cmd.none ];
}

function download(url) {
  return async function*() {
    let response = await fetch( url );
    if (response.ok) {
      let text = await response.text();
      yield ['set-source', text ];
    } else {
      yield ['show-error', 'Could not load content.'];
    }
  }
}    

export function init( { username, repository, filename } ) {
  const url = `https://raw.githubusercontent.com/${username}/${repository}/master/${filename}.tex`;
  
  return [ { filename, loading: true }, download(url) ];
}

export function view( { state, dispatch } ) {
  if (state.error) {
    return <div className="container">
      <h1>Error</h1>
      <p>{ state.error }</p>
      </div>;
  }
  
  if (state.loading) {
    return <div className="container">
      <h1>{ state.filename }</h1>
      <div className="spinner-border" role="status">
      <span className="sr-only">Loading...</span>
      </div>
      </div>;
  } else {
    return <div className="container">
      <h1>{ state.filename }</h1>
      <code><pre>{ state.source }</pre></code>
      </div>;
  }

}

export default { view, init, update };
