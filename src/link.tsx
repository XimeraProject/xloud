import { jsx, VNode } from "snabbdom";
import { Dispatcher } from './tea';
import { NavigationMessage } from './message';

function onClick( dispatch : Dispatcher , href ): (ev: any) => void {
  return function(ev : MouseEvent): void {
    ev.preventDefault();

    dispatch(new NavigationMessage(href));
    history.pushState(null, '', href);
    
    ev.stopPropagation();
  };
}

export default function Link( props, children ) : VNode {
  return <a {...props} attrs={{href:'#'}} on={{click: onClick(props.dispatch, props.href)}}>{ children }</a>;
}
