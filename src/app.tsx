import { jsx, VNode } from "snabbdom";
import Footer from './footer';

import router from './router';
const Router = router.view;

import navbar from './navbar';
const Navbar = navbar.view;

import { Message, State, Dispatcher, Component } from './tea';

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  return <body class={{"d-flex":true, "flex-column":true, "h-100":true}}>
    <header>
    <Navbar state={state} dispatch={dispatch} />
    </header>
    <main attrs={{role: "main"}} class={{"flex-shrink-0":true}}>
    <Router state={state} dispatch={dispatch}/>
    </main>
    <Footer state={state} dispatch={dispatch} />    
    </body>;
}

export function update( message : Message, state : State, dispatch ) {
  return router.update( message,
                        navbar.update( message, state, dispatch ),
                        dispatch );
}

export function init(state, dispatch) {
  return {
    ...navbar.init( state, dispatch ),
    ...router.init( state, dispatch )
  };
}

let App : Component = { view, init, update };
export default App;
