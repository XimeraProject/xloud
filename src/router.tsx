import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component, Viewer, emptyInit, emptyUpdate } from './tea';
import Route from 'route-parser';

import FourOhFour from './four-oh-four';
import ViewSource from './view-source';
import Spinner from './spinner';
import Page from './page';
import {v4} from 'uuid';

import { NavigationMessage, WrappedMessage } from './message';

import { BackgroundProcess, BackgroundProcessComponent } from './background-process';
const backgroundProcessView = BackgroundProcessComponent.view;
const backgroundProcessUpdate = BackgroundProcessComponent.update;

function findRoute( pathname : string, state : State, dispatch : Dispatcher ) : State {
  // FIXME: ugh this is such an ugly hack, and actually seems to fall
  // in some sort of race condition on the deployed website
  if (pathname === '/') {
    let href = '/XimeraProject/about/overview';
    setTimeout( () => history.replaceState(null, '', href), 100);
    setTimeout( () => dispatch(new NavigationMessage(href)), 100);
    return { ...state,
             component: Spinner,
             repository: undefined,
             texFilename: undefined,
           };
  }
  
  let r = new Route('/:owner/:repo/(*filename).tex');
  if (r.match(pathname)) {
    let routeNonce = v4();
    let wrappedDispatch : Dispatcher = function ( message : Message ) : void {
      dispatch( new WrappedMessage( message, routeNonce ) );
    };    

    return { ...ViewSource.init({...state,
                                 routeParams: r.match(pathname) },
                                wrappedDispatch),
             routeNonce,
             component: ViewSource };
  }

  r = new Route('/:owner/:repo/(*filename)');
  if (r.match(pathname)) {
    let routeNonce = v4();
    let wrappedDispatch : Dispatcher = function ( message : Message ) : void {
      dispatch( new WrappedMessage( message, routeNonce ) );
    };
    
    return {...Page.init({...state,
                          routeParams: r.match(pathname) },
                         wrappedDispatch),
            routeNonce,
            component: Page };
  }

  // No route found!
  return { ...state,
           routeNonce: v4(),
           component: FourOhFour,
           repository: undefined,           
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
  let newState = {...state,
                  ...backgroundProcessUpdate( message, state, dispatch )};
  
  if (message.type === 'error') {
    return {...newState,
            backgroundProcess: undefined,
            component: ErrorComponent(message.error) };
  }
  
  if (message.type === 'navigate-to') {
    return findRoute( message.path,
                      {...newState, dropdown: false, flashDanger: false}, dispatch );
  }
  
  if (newState && newState.component) {
    if (message.type === 'wrapped-message') {
      if (state.routeNonce) {
        if (message.nonce === state.routeNonce) {
          return update( message.message, state, dispatch );
        } else {
          // Ignore wrapped messages intended for a different route
          return newState;
        }
      } else {
        console.log('Missing route nonce for',message);
      }
    }
    
    return newState.component.update( message, newState, dispatch );
  }
  
  return newState;
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
  let result = DisplayError('No route found.');
  if (state && state.component) 
    result = state.component.view( {state, dispatch} );
  
  if (state.backgroundProcess)
    return backgroundProcessView( {state,
                                   dispatch,
                                   background: result } );
  
  return result;
}

let Router : Component = { view, init, update };

export default Router;

