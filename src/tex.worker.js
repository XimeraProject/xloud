import texCorePath from '../tex/core.dfdb85e110a7.dump.gz';
import texBinaryPath from '../tex/out.f9c8838f85a0.wasm';

import * as library from './library.js';

import pako from 'pako';
import { ReadableStream } from "web-streams-polyfill";
import fetchStream from 'fetch-readablestream';

let pages = 2500;

var coredump = undefined;
var code;
let compiled;

var theTerminal;
var editor;

async function load() {
  if (coredump)
    return coredump;
  
  let tex = await fetch(texBinaryPath);
  postMessage({text: "."});
  
  code = await tex.arrayBuffer();
  
  let response = await fetchStream(texCorePath);
  const reader = response.body.getReader();
  const inf = new pako.Inflate();
  
  try {
    while (true) {
      const {done, value} = await reader.read();
      inf.push(value, done);
      postMessage({text: "."});      
      if (done) break;
    }
  }
  finally {
    reader.releaseLock();
  }

  compiled = new WebAssembly.Module(code);
  postMessage({text: "."});
  
  coredump = new Uint8Array( inf.result, 0, pages*65536 );

  return coredump;
}

function copy(src)  {
  var dst = new Uint8Array(src.length);
  dst.set(src);
  return dst;
}

async function compile(callback) {
  postMessage({text: "Loading TeX image..."});
  await load();
  postMessage({text: "Loaded!\n"});

  postMessage({text: "Copying memory..."});  
  const memory = new WebAssembly.Memory({ initial: pages, maximum: pages });  
  const buffer = new Uint8Array(memory.buffer, 0, pages * 65536);
  buffer.set(copy(coredump));
  library.setMemory(memory.buffer);
  library.setTexliveVersion( process.env.TEXLIVE_VERSION );
  postMessage({text: "Copied!\n"});

  library.setDirectory('');
  library.setInput(' \\PassOptionsToClass{web}{ximera}\\input{texput}');
  //library.setInput(' texput.tex');
  
  library.setCallback(() => {
    const filename = 'texput.dvi';
    //let data = library.readFileSync( filename )
    console.log('Trying to read output...');
    const data = library.readFileSync('texput.dvi');
    //self.postMessage({ dvi: data }, [data.buffer]);
    console.log('**** DONE');

    const aux = library.readFileSync('texput.aux');
    console.log('AUX',aux);
    
    callback( null, data.buffer );
  });
  
  let instance;

  try {
    postMessage({text: "Instantiating WebAssembly..."});    
    instance = await WebAssembly.instantiate(compiled, {
      library,
      env: { memory },
    });
  } catch (err) {
    console.log(err);
  }
    
  const wasmExports = instance.exports;
  library.setWasmExports(wasmExports);

  postMessage({text: "Launched!\n\n"});
  wasmExports.main();
}

function fetchInput(url) {
  return new Promise( function(resolve,reject) {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          reject(response.statusText);
        } else 
          resolve(response.text());
      })
      .catch(reject);
  });
}

onmessage = async function(e) {
  let url = e.data.url;
  let source = await fetchInput(url);

  let texmf = {};
  library.deleteEverything();
  library.setTexput(source);
  library.setTexmfExtra(texmf);
  library.setTexputAux(new Uint8Array());
  
  library.setConsoleWriter((x) => {
    postMessage({text: x});
  });

  compile( function (err, dvi) {
    if (err) {
    } else {
      const aux = library.readFileSync('texput.aux');
      library.deleteEverything();
      library.setTexput(source);
      library.setTexputAux(aux);
      compile( function (err, dvi) {
        if (err) {
        } else {
          postMessage({dvi: dvi});
        }
      });
    }
  });
}
