import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

import MathExpression from 'math-expressions/lib/math-expressions.js';

// btn-primary with question
// btn-danger with times
// btn-success with check

export default function(data : string, block : any, state : any, update : (( value : any ) => void) ) : VNode {
  let value = '';

  if (state['v'])
    value = state['v'];

  let answer = MathExpression.fromText(data);  
  
  const click = function(ev) {
    try {
      let response = MathExpression.fromText(value);
      if (answer.equals( response )) {
        update( { ...state,
                  r: value,
                  c: true } );        
      } else {
        update( { ...state,
                  r: value,                  
                  c: false } );
      }
    } catch (err) {
      // FIXME: do something 
    }
  };

  const input = function(ev) {
    update( { ...state,
              v : ev.target.value } );
  };    

  let control = <input props={{value}} class={{'form-control': true}} on={{input}} style={{'padding': '2pt'}}/>;

  let classes : any = {'btn-primary': true};
  let label = 'question';

  if (state['c']) {
    classes = {'btn-success': true};
    label = 'check';    
  }

  if (state['c'] === false) {
    if (value === state['r']) {
      classes = {'btn-danger': true};
      label = 'times';
    }
  }
  
  let button = <button on={{click}} class={{...classes, 'btn': true}} attrs={{type: 'button'}}>
      <Icon fa={label}/>
      </button>;
  
  return <div class={{'input-group': true}} style={{ width: "100%", height: "100%" }}>{ control }{ button }</div>;
}
