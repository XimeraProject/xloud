import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from './tea';
import Icon from './icon';

export function update( message : Message, state : State, _dispatch : Dispatcher ) : State {
  return state;
}

export function init( state : State, dispatch : Dispatcher ) : State {
  return state;
}

export function view( {state, dispatch} : { state : State, dispatch : Dispatcher } ): VNode {
  let links : VNode[] = [];  

  if (state.owner && state.repo && state.branch) {
    let directLink = `https://github.com/${state.owner}/${state.repo}/blob/${state.branch}/${state.texFilename}`;    
    let issueHref = `https://github.com/${state.owner}/${state.repo}/issues/new?title=${state.title}&body=%0A%0ASee%20[${state.texFilename}](${directLink})`;
    let b = <li><a class={{"dropdown-item":true}} attrs={{href:issueHref}}><Icon fa="exclamation-triangle"/>&nbsp;Report error to authors</a></li> ;
    links.push(b);
  }

  links.push( <li><a class={{"dropdown-item":true}} attrs={{href:`mailto:help@ximera.cloud?Subject=${window.location.pathname}`}}><Icon fa="envelope"/>&nbsp;Request help using Ximera</a></li> );

  links.push( <li><a class={{"dropdown-item":true}} attrs={{href:`https://github.com/XimeraProject/xloud/issues/new?title=${window.location.pathname}`}}><Icon fa="bug"/>&nbsp;Report bug to programmers</a></li> );
  
  return <li class={{"nav-item":true, "dropdown":true}}>
    <a class={{"nav-link":true, "dropdown-toggle":true}} attrs={{href: "#", id:"doenetHelpDropdown", role: "button", "data-bs-toggle": "dropdown",  "aria-expanded": "false"}}>
    <Icon fa="hands-helping"/>&nbsp;Get Help</a>
    <ul class={{"dropdown-menu":true}} attrs={{"aria-labelledby": "doenetHelpDropdown"}}>
    { links }
    </ul>
    </li>;
}

let GetHelp : Component = { view, init, update };
export default GetHelp;
