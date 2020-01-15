import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';

export function update( message, state ) {
  if (message[0] === 'output-console')
    return [ { ...state, console: (state.console ? state.console : '') + message[1], loading: false },
             Cmd.none ];

  if (message[0] === 'finished-compiling')
    return [ { ...state, compiling: false },
             Cmd.none ];
  
  return [ state, Cmd.none ];
}

function compile({username, repository, filename}) {
  let repositoryName = `${username}/${repository}`;
  
  return async function*() {
    let tex = new Worker('./tex.ts', { type: 'module' });
    
    tex.postMessage( { paperwidth: document.body.clientWidth * 3 / 4,
		       repositoryName: repositoryName,
		       pathName: filename } );

    let done = false;
    let consolePromise = { resolve: function(x) { return x; } };
    
    tex.addEventListener('message', function (msg) {
      if (msg.data.dvi) {
        done = true;
        consolePromise.resolve('');
      } else if (msg.data.console) {
        consolePromise.resolve(msg.data.console);
      } else {
        consolePromise.resolve('');
      }
    });
    
    while(!done) {
      let output = await new Promise((resolve) => {
        consolePromise.resolve = resolve;
      });
      yield ['output-console', output];
    }
    
    yield ['finished-compiling'];
  }
}

export function init( { username, repository, filename } ) {
  const url = `https://raw.githubusercontent.com/${username}/${repository}/master/${filename}.tex`;
  
  return [ { username, repository, filename, compiling: true },
           compile({ username, repository, filename }) ];
}

export function view( { state, dispatch } ) {
  if (state.compiling) {
    return <div className="container">
      <div className="float-right spinner-border" role="status">
      <span className="sr-only">Loading...</span>
      </div><h1>Compiling { state.filename }&hellip;</h1>
      <pre>{ state.console }</pre>
      </div>;
  } else {
    return <div className="container">
      <h1>Compiling { state.filename }&hellip;</h1>
      <pre>{ state.console }</pre>
      </div>;    
  }
}

export default { view, init, update };
