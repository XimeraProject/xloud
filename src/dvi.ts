import { dvi2vdom } from 'dvi2html';
import './fonts/tex/tex.css';

import { h, VNode } from 'snabbdom'; // helper function for creating vnodes
import { Buffer } from 'buffer';

function ximeraRuleHandler( data : string ) : VNode[] {
  let kind = data.split(' ')[0];
  let payload = data.split(' ')[1];  

  if (kind === 'youtube') {
    return [h('iframe', { attrs: { width: "100%", height: "100%",
                                   frameborder: "0",
                                   allowfullscreen: true,
                                   src: `https://www.youtube.com/embed/${payload}`} }
             )];
  }

  if (kind === 'answer') {
    //return [h('input', { style: { width: "100%", height: "100%" }})];
    return [h('div', { class: {'input-group': true}, style: { width: "100%", height: "100%" }},
              [h('input', { class: {'form-control': true}, style: {'padding': '2pt'}}),
               h('button', { attrs: {type: 'button'}, class: {'btn': true, 'btn-outline-secondary': true}},
                 ['?']
                )]
             )];
  }

  // <div class="input-group mb-3">
  //  <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2">
    //<div class="input-group-append">
    //<button class="btn btn-outline-secondary" type="button">Button</button>
  //</div>
  //</div>
  
  return [h('div', {}, data )];
}

export function render(dvi) {
  let vdoms = [] as any;

  // This fixes how snabbdom handles svg
  const myCreateElement = function (tagName, options, children) {
    if (options && options.props && options.props.innerHTML) {
      return h(tagName,
	       {
		 ...options,
		 domProps: options.props, 
	       },
	       children);
    } 
    return h(tagName, options, children);
    
  };

  let buffer = new Buffer(dvi);

  let result = dvi2vdom(buffer, h,
                        ximeraRuleHandler,
	   (vdom) => {
	     vdoms.push(vdom);
	   });

  console.log('result=',result);
  
  let root = h('div', { class: { tex: true } }, vdoms);
  let root2 = h('div', { class: { desktop: true } }, [root]);
  
  return root2;
}

