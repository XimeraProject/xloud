////////////////////////////////////////////////////////////////
// Load a bunch of CSS
import './scss/app.scss';
import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas);
dom.i2svg();

////////////////////////////////////////////////////////////////
// Display a banner
import { version } from '../package.json';
console.log("This is\n" +
"  ▀██▄   ▄██▀ ██ █████     █████ ▄███████████████████▄    ███\n" + 
"    ▀██▄██▀   ██▐██ ▐██   ██▌ ██▌██                 ██▌  ██▀██\n" + 
"      ███     ██▐██  ██▌ ▐██  ██▌▐█████████ ▄████████▀  ██▀ ▀██\n" + 
"    ▄██▀██▄   ██▐██  ▐██ ██▌  ██▌██        ▐█▌  ▀██▄   ██▀   ▀██\n" + 
"  ▄██▀   ▀██▄ ██▐██   ▀███▀   ██▌▀█████████▐█▌    ▀██▄██▀     ▀██\n" +
"version",version);

////////////////////////////////////////////////////////////////
// the elm architecture lifecycle, via snabbdom

import Snabbdom from 'snabbdom-pragma';
import * as snabbdom from 'snabbdom';

import clazz from 'snabbdom/es/modules/class';
import props from 'snabbdom/es/modules/props';
import style from 'snabbdom/es/modules/style';
import eventlisteners from 'snabbdom/es/modules/eventlisteners';
const patch = snabbdom.init([clazz, props, style, eventlisteners]);

// the initial container
var vnode;
let state;

function repaint() {
  if (vnode === undefined)
    vnode = patch(document.body, app.view({state, dispatch}));
  else
    vnode = patch(vnode, app.view({state, dispatch}));
}

window.onpopstate = function() {
  dispatch( ['navigate-to', window.location.pathname] );
};

import app from './app';

function update(stateAndCommand) {
  state = stateAndCommand[0];

  window.requestAnimationFrame( repaint );
  
  let command = stateAndCommand[1];

  (async () => {
    for await (const message of command() ) {
      dispatch(message);
      window.requestAnimationFrame( repaint );
    }
  })();
}

export function dispatch(message) {
  update( app.update(message, state) );
}

update( app.init() );


