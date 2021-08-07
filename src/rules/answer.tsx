import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

import MathExpression from 'math-expressions/lib/math-expressions.js';

export default function(data : string, block : any, options : any, _children : VNode[]) : VNode {
  let value = '';

  if (block.db['v'])
    value = block.db['v'];

  let answer = MathExpression.fromText(data);  
  
  const click = function(ev) {
    try {
      let response = MathExpression.fromText(value);
      if (answer.equals( response )) {
        block.update( { ...block.db,
                        r: value,
                        c: true } );        
      } else {
        block.update( { ...block.db,
                        r: value,                  
                        c: false } );
      }
    } catch (err) {
      // FIXME: do something 
    }
  };

  const input = function(ev) {
    block.update( { ...block.db,
                    v : ev.target.value } );
  };

  // Trigger button click on enter
  const keyup = function(ev) {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      click(ev);
    }
  };

  block.needsResponse = true;
  
  let classes : any = {'btn-primary': true};
  let label = 'question';

  if (block.db['c']) {
    classes = {'btn-success': true};
    label = 'check';
    block.correctResponse = true;
  }

  if (block.db['c'] === false) {
    if (value === block.db['r']) {
      classes = {'btn-danger': true};
      label = 'times';
    }
  }

  let control = <input props={{value}} class={{'form-control': true}} attrs={{'disabled': classes['btn-success']===true}} on={{input, keyup}} style={{'padding': '2pt'}}/>;  
  
  let button = <button on={{click}} class={{...classes, 'btn': true}} attrs={{type: 'button'}}>
      <Icon fa={label}/>
      </button>;
  
  return <div class={{'input-group': true}} style={{...options.style}}>{ control }{ button }</div>;
}
