import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';
import logo from '../public/logo/logo.svg';
import { Link } from './router';

const brandStyle = { maxHeight: "1rem", opacity: "0.5", verticalAlign: "baseline"};
function Brand() { return <img src={logo} style={brandStyle}/>; }

export function view( { state, dispatch } ) {
  return <nav className="navbar fixed-top navbar navbar-expand-md navbar-light bg-light">
    <Link className="navbar-brand" dispatch={dispatch} href="/"><Brand/></Link>
    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
    <ul className="navbar-nav">
    <li className="nav-item">
    <Link className="nav-link" dispatch={dispatch} href="/help">Help</Link>
    </li>
    <li className="nav-item">
    <a className="nav-link" href="#">Features</a>
    </li>
    </ul>
    </div>
    </nav>;
}

export default view;
