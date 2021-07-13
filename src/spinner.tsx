import './spinner.css';
import { jsx } from "snabbdom";

export function view( {state, dispatch} ) {
  return <div class={{spinner:true}}>Loading...</div>;
}

export default view;
