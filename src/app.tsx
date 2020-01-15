import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';

import Footer from './footer';
import Navbar from './navbar';

import router from './router';
const Router = router.view;

export function view( { state, dispatch } ) {
  return <body className="d-flex flex-column h-100">
    <header>
    <Navbar state={state} dispatch={dispatch} />
    </header>
    <main role="main" className="flex-shrink-0">
    <Router state={state} dispatch={dispatch}/>
    </main>    
    <Footer state={state} dispatch={dispatch} />
    </body>;
}

export function update( message, state ) {
  return router.update( message, state );
}

export function init() {
  return router.init();
}

export default { init, update, view };
