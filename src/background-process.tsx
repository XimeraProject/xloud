import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component, Viewer, emptyInit, emptyUpdate } from './tea';
import { UpdateTimeMessage } from './message';
import { view as Spinner } from './spinner';
import moment from 'moment';
import "./opacity.css";
import "./outer-glow.css";

export class BackgroundProcess {
  started : Date;
  message : string;  
  estimate : number;
  
  constructor(message : any, estimate = 10) {
    this.message = message;
    this.started = new Date();
    this.estimate = estimate;
  }
}

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

let debounced = debounce( tickTock, 1000 );

let theDispatch : Dispatcher | undefined = undefined;

function tickTock() {
  if (theDispatch)
    theDispatch( new UpdateTimeMessage() );  
}


export function update( message : Message, state : State, dispatch : Dispatcher ) : State {
  return {...state,
          time: new Date() };
}

export function view( {state, dispatch, background} : { state : State, dispatch : Dispatcher, background : VNode } ): VNode {
  theDispatch = dispatch;

  debounced();
  
  if (state.backgroundProcess) {
    let started = moment(state.backgroundProcess.started);
    let now = moment(new Date());
    let seconds = now.diff(started, 'seconds', true);

    let takingSoLong = <div></div>;
    
    if (seconds > state.backgroundProcess.estimate) {
      takingSoLong = <div>This is taking longer than expected.</div>;      
    }
    
    return <div>
      <div style={{"height": "0px", "margin-top": "75px"}} class={{"outer-glow":true, "row":true, "align-items-center":true}}>
      <div class={{"col":true}}>
      <Spinner dispatch={dispatch} state={state}/>
      <div class={{"outer-glow":true, "text-center": true}}>{ state.backgroundProcess.message }&hellip;</div>
      <div class={{"outer-glow":true, "text-center": true}}>{ takingSoLong }</div>
      </div>
      </div>
      <div class={{"opacity-2": true}}>{ background }</div>
      </div>;
  }

  return background;
}

export const BackgroundProcessComponent = { view, update: update };

