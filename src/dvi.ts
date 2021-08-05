import { dvi2vdom } from 'dvi2html';
import './fonts/tex/tex.css';

import { Message, State, Dispatcher, Component } from './tea';
import { stateToPathname } from './state';
import { PatchDoenetDatabaseMessage } from './message';

import { h, VNode } from 'snabbdom'; // helper function for creating vnodes
import { Buffer } from 'buffer';

import Icon from './icon';

interface XimeraBlock {
  type: string;
  id: string;
  render(): VNode[];
  
  parent: XimeraBlock | undefined;
  push( child : XimeraBlock ) : void;
}

class XimeraEnvironment implements XimeraBlock {
  type: "environment" = "environment";
  id : string = '';
  children : XimeraBlock[] = [];  
  parent : XimeraBlock | undefined;

  db : any;
  update( value : any ) : void {}
  
  needsResponse : boolean = false;
  correctResponse : boolean = false;
  
  constructor(public name : string ) {};

  push( child : XimeraBlock ) : void {
    child.parent = this;
    child.id = `${this.id}/${this.children.length}`;
    this.children.push( child );
  }

  render() : VNode[] {
    let flattened = this.children.map( (x) => x.render() ).flat();

    // The root always reveals all its children
    if (this.id === '')
      return [h('div', {style: {}}, flattened)];

    
    
    return [h('div', {style: {}}, flattened)];    
  }
}

class XimeraPage implements XimeraBlock {
  type: "page" = "page";
  parent : XimeraBlock | undefined;
  id : string = '';

  db : any;
  update( value : any ) : void {}    
  
  needsResponse : boolean = false;
  correctResponse : boolean = false;  
  
  constructor(public page : VNode ) {};

  push( child : XimeraBlock ) : void {}

  render() : VNode[] {
    return [this.page];
  }
}

class XimeraRule implements XimeraBlock {
  type: "rule" = "rule";
  parent : XimeraBlock | undefined;
  id : string = '';

  db : any;
  update( value : any ) : void {}  

  needsResponse : boolean = false;
  correctResponse : boolean = false;
  
  constructor(public kind : string, public data : string ) {};

  push( child : XimeraBlock ) : void {}

  render() : VNode[] { return []; }
}

let rootBlock : XimeraBlock = new XimeraEnvironment('root');
let blockStack : XimeraBlock[] = [];

function ximeraPushHandler( data : string, state : State, dispatch : Dispatcher ) {
  let block = new XimeraEnvironment(data);
  blockStack[0].push( block );
  blockStack.unshift( block );

  const pathname = stateToPathname(state);
  let db = state.databases?.get(pathname);

  block.db = {};
    
  if (db && db[block.id]) {
    block.db = db[block.id];
  }

  block.update = function(value : any) : void {
    dispatch( new PatchDoenetDatabaseMessage( pathname, block.id, value ) );
  };
}

function ximeraPopHandler() {
  blockStack.shift();
}

import handlers from './rules/index.ts';

function ximeraRuleHandler( data : string, options : any, children : VNode[], state : State, dispatch : Dispatcher ) : VNode {
  let kind = data.split(' ')[0];
  let payload = data.split(' ').slice(1).join(' ');

  console.log(data,children);
  
  // add this rule to the blockstack
  let block = new XimeraRule(kind, payload);
  blockStack[0].push( block );

  const pathname = stateToPathname(state);
  let db = state.databases?.get(pathname);

  block.db = {};
    
  if (db && db[block.id]) {
    block.db = db[block.id];
  }

  block.update = function(value : any) : void {
    dispatch( new PatchDoenetDatabaseMessage( pathname, block.id, value ) );
  };
    
  if (kind in handlers) {
    return handlers[kind](payload, block, options, children);
  }

  return h('div', {style: options.style}, data );
}

export function render(dvi, state : State, dispatch : Dispatcher) {
  let buffer = new Buffer(dvi);

  rootBlock = new XimeraEnvironment('root');
  blockStack = [rootBlock];
  
  let result = dvi2vdom(buffer, h,
                        (data : string, options : any, children : VNode[]) => ximeraRuleHandler(data, options, children, state, dispatch),
                        (data : string ) => ximeraPushHandler(data, state, dispatch),
                        ximeraPopHandler,
	                (vdom : VNode) => {
                          blockStack[0].push(new XimeraPage(vdom));
	                });

  let root = h('div', { class: { tex: true } }, rootBlock.render());
  let root2 = h('div', { class: { desktop: true } }, [root]);

  console.log(rootBlock);
  console.log(state.databases);
  console.log(state);
  
  return root2;
}

