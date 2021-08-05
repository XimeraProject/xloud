import { jsx, VNode } from "snabbdom";
import { Message, State, Dispatcher, Component } from '../tea';
import Icon from '../icon';

function checkSelectall(data : string, block : any, options : any, children : VNode[]) : VNode {
  let parent = block.parent;
  
  let classes : any = {'btn-primary': true};
  let label = 'question';
  let phrase = 'Check Work';

  parent.needsResponse = true;

  let disabled = true;
  
  let value = {};
  if (parent.db['v']) {
    value = parent.db['v'];
    disabled = false;
  }

  let previousValue = {};
  if (parent.db['r']) {
    previousValue = parent.db['r'];
  }  

  let wouldBeCorrect =
      parent.children
      .filter( (x) => x.type === 'rule' )
      .filter( (x) => x.kind === 'selectall' )
      .filter( (x) => (value[x.id] === true) !== (x.data === 'correct') )
      .length == 0;
  
  if (parent.db['c']) {
    classes = {'btn-success': true};
    label = 'check';
    phrase = 'Correct';    
    parent.correctResponse = true;
  }

  if (parent.db['c'] === false) {
    let sameAsBefore =
        parent.children
        .filter( (x) => x.type === 'rule' )
        .filter( (x) => x.kind === 'selectall' )
        .filter( (x) => (value[x.id] === true) !== (previousValue[x.id] === true) )
        .length == 0;

    if (sameAsBefore) {
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

export default function(data : string, block : any, options : any, children : VNode[]) : VNode {
  let parent = block.parent;
  
  if (parent.name === 'selectall') {
    return checkSelectall( data, block, options, children );
  }
  
  let classes : any = {'btn-primary': true};
  let label = 'question';
  let phrase = 'Check Work';

  parent.needsResponse = true;

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
