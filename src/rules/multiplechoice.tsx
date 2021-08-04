import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

export default function(data : string, block : any, options : any, children : VNode[]) : VNode {
  let parent = block.parent;

  let value = '';
  if (parent.db['v'])
    value = parent.db['v'];

  let disabled = false;
  if (parent.db['c'])
    disabled = true;
  
  const click = function(ev) {
    if (!disabled) {
      parent.update( { ...parent.db,
                       v: block.id,
                       w: data === 'correct'
                     } );
    }
  };
  
  let button = <button on={{click}} style={{...options.style}} class={{'btn-outline-secondary':true, 'btn': true}} attrs={{'disabled': disabled, type: 'button'}}>{ children }</button>;

  if (value === block.id) {
    button = <button on={{click}} style={{...options.style}} class={{'btn-secondary':true, 'btn': true}} attrs={{'disabled': disabled, type: 'button'}}>{ children }</button>;
  }
  
  return button;
}
