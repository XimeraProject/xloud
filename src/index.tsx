////////////////////////////////////////////////////////////////
// Load our CSS
import './base.css';

import 'bootstrap'; // include the bootstrap javascript

////////////////////////////////////////////////////////////////
//
//  ▀██▄   ▄██▀ ██ █████     █████ ▄███████████████████▄    ███
//    ▀██▄██▀   ██▐██ ▐██   ██▌ ██▌██                 ██▌  ██▀██
//      ███     ██▐██  ██▌ ▐██  ██▌▐█████████ ▄████████▀  ██▀ ▀██
//    ▄██▀██▄   ██▐██  ▐██ ██▌  ██▌██        ▐█▌  ▀██▄   ██▀   ▀██
//  ▄██▀   ▀██▄ ██▐██   ▀███▀   ██▌▀█████████▐█▌    ▀██▄██▀     ▀██
//
import { version } from '../package.json';
import logo from '../public/logo/logo.svg';
const cleanedLogo = logo.replace('data:image/svg+xml,',"");
console.log('This is\n%c ',
            `background-image: url("data:image/svg+xml;utf8,${cleanedLogo}"); background-size: 256px 42px; line-height: 0px; padding: 21px 128px; background-position: center; background-repeat: no; margin: 0; font-size: 0px;`);
console.log(`version ${version}`);

////////////////////////////////////////////////////////////////
// my riff on the elm architecture, via snabbdom
import { jsx, VNode } from "snabbdom";

import {
  init,
  classModule,
  propsModule,
  styleModule,
  attributesModule,
  eventListenersModule,
  h,
} from "snabbdom";

import { Message, State, Dispatcher, Component } from './tea';

var patch = init([ // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  attributesModule, // for setting attributes on DOM elements
  styleModule, // handles styling on elements with support for animations
  eventListenersModule, // attaches event listeners
]);

var vnode : VNode; // the initial container
let state : State = {};

function repaint() {
  if (vnode === undefined)
    vnode = patch(document.body, app.view({state, dispatch}));
  else
    vnode = patch(vnode, app.view({state, dispatch}));
}

import { NavigationMessage, ResizeMessage } from './message';

window.onpopstate = function() {
  dispatch( new NavigationMessage(window.location.pathname) );
};

window.onresize = function() {
  dispatch( new ResizeMessage(window.innerWidth, window.innerHeight) );
};

import app from './app';

/* I am using requestAnimationFrame instead */
function debounce(func, wait : number) {
  var timeout : number | undefined;
  return function(): void {
    function later() {
      timeout = undefined;
      func();
    }
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
};

const repaintSlowly = debounce( repaint, 10 );

function update(newState : State) {
  state = {...newState};
  repaintSlowly();
  //window.requestAnimationFrame( repaint );
}

export function dispatch(message : Message): void {
  update( app.update(message, state, dispatch) );
}

update( app.init(state, dispatch) );




