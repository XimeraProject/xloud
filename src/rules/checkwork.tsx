import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

export default function(data : string, block : any, options : any, children : VNode[]) : VNode {
  let classes : any = {'btn-primary': true};
  let label = 'question';
  let phrase = 'Check Work';
  
  let parent = block.parent;

  let disabled = true;
  let value = '';
  if (parent.db['v']) {
    value = parent.db['v'];
    disabled = false;
  }

  let wouldBeCorrect = false;
  if (parent.db['w'])
    wouldBeCorrect = parent.db['w'];

  if (parent.db['c']) {
    classes = {'btn-success': true};
    label = 'check';
    phrase = 'Correct';    
    parent.correctResponse = true;
  }

  if (parent.db['c'] === false) {
    if (value === parent.db['r']) {
      classes = {'btn-danger': true};
      label = 'times';
      phrase = 'Try Again';
    }
  }

  const click = function(ev) {
    if ((value !== '') && (!disabled)) {
      parent.update( { ...parent.db,
                       c: wouldBeCorrect,
                       r: value } );
    }
  };
  
  return <button on={{click}} class={{...classes, 'btn': true, }} style={{...options.style}} attrs={{'disabled': disabled}}><Icon fa={label}/>&nbsp;{ phrase }</button>;
}
