import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import Route from 'route-parser';

import ViewSource from './view-source';
import Page from './page';
import Home from './home';
import Help from './help';

function merge( state, stateAndCommands ) {
  return [ { ...state, ...stateAndCommands[0] },
           stateAndCommands[1] ];
}

function findRoute( pathname ) {
  let r = new Route('/:username/:repository/(*filename).tex');
  
  if (r.match(pathname))
    return merge( { component: ViewSource }, ViewSource.init(r.match(pathname)) );

  if (pathname === '/help')
    return [{ component: Help }, Cmd.none];
  
  if (pathname === '/')
    return [{ component: Home }, Cmd.none];

  r = new Route('/:username/:repository/(*filename)');
  if (r.match(pathname))
    return merge( { component: Page }, Page.init(r.match(pathname)) );

  
  // No route found!
  return [{}, Cmd.none];
}

export function update( message, state ) {
  if (message[0] == 'navigate-to') {
    return findRoute( message[1] );
  }
  
  if (state && state.component) 
    return state.component.update( message, state );
  else
    return [ state, Cmd.none ];
}

export function init() {
  return findRoute( window.location.pathname );
}

function DisplayError(text) {
  return  <div className="container">
    <h1>Error!</h1>
    <p>{ text }</p>
    </div>;
}

export function view( { state, dispatch } ) {
  if (state && state.component) 
    return state.component.view( { state, dispatch } );
  else
    return DisplayError('No route found.');
}

const stopPropagation = function(ev) { ev.stopPropagation() };
const preventDefault = function(ev) { ev.preventDefault() };

export function Link( props, children ) {
  return <a {...props} on-click={[[preventDefault], [props.dispatch, ['navigate-to', props.href]], [() => history.pushState(null, '', props.href)], [stopPropagation]]}>{ children }</a>;
}

export default { view, init, update, Link };
