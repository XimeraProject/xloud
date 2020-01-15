import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';


export function update( message, state ) {
  return [ state, Cmd.none ];
}

export function init() {
  return [ {}, Cmd.none ];
}

export function view( { state, dispatch } ) {
  return <div className="container">
    <h1>Welcome</h1>
    <p>You have found the Xloud.</p>
    </div>
}

export default { view, init, update };
