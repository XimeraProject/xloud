import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component, Viewer, emptyInit, emptyUpdate } from './tea';
import Route from 'route-parser';

import FourOhFour from './four-oh-four';
import ViewSource from './view-source';
import Spinner from './spinner';
import Page from './page';

import { NavigationMessage } from './message';

function findRoute( pathname : string, state : State, dispatch : Dispatcher ) : State {
  // FIXME: ugh this is such an ugly hack, and actually seems to fall
  // in some sort of race condition on the deployed website
  if (pathname === '/') {
    let href = '/XimeraProject/about/overview.tex';
    setTimeout( () => history.replaceState(null, '', href), 100);
    setTimeout( () => dispatch(new NavigationMessage(href)), 100);
    return { ...state,
             component: Spinner,
             owner: undefined,
             repo: undefined,
             texFilename: undefined,
           };
  }
  
  let r = new Route('/:owner/:repo/(*filename).tex');
  if (r.match(pathname))
    return {...ViewSource.init({...state,
                                routeParams: r.match(pathname) },
                               dispatch), component: ViewSource };

  r = new Route('/:owner/:repo/(*filename)');
  if (r.match(pathname))
    return {...Page.init({...state,
                          routeParams: r.match(pathname) },
                         dispatch), component: Page };

  // No route found!
  return { ...state,
           component: FourOhFour,
           owner: undefined,
           repo: undefined,
           texFilename: undefined,
         };
}

function ErrorComponent(text : string) : Component {
  let view : Viewer = function ({state, dispatch}): VNode {
    return  <div class={{"container":true}}>
      <h1>Error 500</h1>
      <p>{ text }</p>
      </div>;
  };
  
  return { view, init: emptyInit, update: emptyUpdate }
}

export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  if (message.type === 'error') {
    return {...state, component: ErrorComponent(message.error) };
  }
  
  if (message.type === 'navigate-to') {
    return findRoute( message.path,
                      {...state, dropdown: false, flashDanger: false}, dispatch );
  }
  
  if (state && state.component) 
    return state.component.update( message, state, dispatch );
  
  return state;
}

export function init(state : State, dispatch : Dispatcher) : State {
  return findRoute( window.location.pathname, state, dispatch );
}

function DisplayError(text) {
  return  <div class={{"container":true}}>
    <h1>Error 500</h1>
    <p>{ text }</p>
    </div>;
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  if (state && state.component) 
    return state.component.view( {state, dispatch} );
  else
    return DisplayError('No route found.');
}

let Router : Component = { view, init, update };

export default Router;

