import { jsx, VNode } from "snabbdom";
import logo from '../public/logo/logo.svg';
import { Link } from './router';

const brandStyle = { maxHeight: "1rem", opacity: "0.5", verticalAlign: "baseline"};
function Brand() { return <img attrs={{src: logo}} style={brandStyle}/>; }

export function view( { state, dispatch } ) {
  let buttons : VNode[] = [];

  if (state.owner && state.repo) {
    let branch = 'master'; // FIXME
    let editHref = `https://github.com/${state.owner}/${state.repo}/edit/${branch}/${state.texFilename}`;
    let b = <li class={{"nav-item":true}}>
        <a class={{"btn": true, "btn-outline-secondary": true, "nav-link":true}} attrs={{href:editHref}}>Edit</a>
        </li>;
    buttons.push(b);
  }
  
  return <nav class={{navbar:true, "fixed-top":true, "navbar-expand-md":true, "navbar-light":true, "bg-light": true}}>
    <Link class={{"navbar-brand":true}} dispatch={dispatch} attrs={{href: "/"}}><Brand/></Link>
    <button class={{"navbar-toggler":true}} type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class={{"navbar-toggler-icon":true}}></span>
    </button>
    <div class={{collapse:true, "navbar-collapse":true}} id="navbarNav">
    <ul class={{"navbar-nav":true}}>
    <li class={{"nav-item":true}}>
    <Link class={{"nav-link":true}} dispatch={dispatch} attrs={{href: "/help"}}>Help</Link>
    </li>
    { buttons }
    </ul>
    </div>
    </nav>;
}

export default view;
