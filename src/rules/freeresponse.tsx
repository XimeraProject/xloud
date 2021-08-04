import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

export default function(data : string, block : any, options : any, children : VNode[]) : VNode {
  let value = '';

  if (block.db['v'])
    value = block.db['v'];

  const change = function(ev) {
    block.update( { ...block.db,
                    v: ev.target.value } );
  };
  
  return <textarea on={{change}} style={{...options.style}} class={{'form-control': true}} attrs={{rows:'3'}}>{ value }</textarea>;
}
