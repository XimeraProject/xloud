
import texCorePath from '../tex/core.565e78b2c4ab.dump.gz';
import texBinaryPath from '../tex/out.65aa873359a6.wasm';
import * as library from './library.js';

import pako from 'pako';
import { ReadableStream } from "web-streams-polyfill";
import fetchStream from 'fetch-readablestream';

import * as localForage from "localforage";

let pages = 2500;

var coredump = undefined;
var code;
let compiled;

var theTerminal;
var editor;

let isRunning = false;

async function load() {
  if (!code) {
    code = await localForage.getItem('tex');
  }

  if (!code) {
    let tex = await fetch(texBinaryPath);
    postMessage({text: "."});
    code = await tex.arrayBuffer();
  }

  if (!coredump)
    coredump = await localForage.getItem('coredump');
  
  compiled = new WebAssembly.Module(code);
  postMessage({text: "."});

  console.log(compiled);
  
  if (coredump)
    return coredump;
  
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

  coredump = new Uint8Array( inf.result, 0, pages*65536 );
  localForage.setItem('coredump', coredump);
  
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
  
  const memoryBackup = new WebAssembly.Memory({ initial: pages, maximum: pages });    
  library.setMemoryBackup(memoryBackup.buffer);
  
  console.log( 'TEXLIVE', process.env.TEXLIVE_VERSION );
  library.setTexliveVersion( process.env.TEXLIVE_VERSION );
  
  postMessage({text: "Copied!\n"});

  library.setDirectory('');
  library.setInput(' \\PassOptionsToClass{web}{ximera}\\input{texput}');
  
  library.setCallback(() => {
    const filename = 'texput.dvi';
    console.log('Trying to read output...');
    const data = library.readFileSync('texput.dvi');
    const aux = library.readFileSync('texput.aux');
    callback( null, data.buffer );
  });
  
  let instance;

  try {
    postMessage({text: "Instantiating WebAssembly..."});

    instance = await WebAssembly.instantiate(compiled, {
      library,
      env: { memory }
    });

  } catch (err) {
    console.log(err);
  }
    
  const wasmExports = instance.exports;
  library.setWasmExports(wasmExports);

  postMessage({text: "Launched!\n\n"});
  wasmExports.main();
  wasmExports.asyncify_stop_unwind();  
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

async function recompile(e) {
  // FIXME: probably should provide an actual error
  if (isRunning) return;
  
  library.setCallback(() => {
    isRunning = false;    
    const filename = 'texput.dvi';
    console.log('Trying to read resurrected output...');
    const data = library.readFileSync('texput.dvi');
    const aux = library.readFileSync('texput.aux');
    postMessage({dvi: data.buffer, hsize: library.getHsize()});    
  });

  isRunning = true;
  library.resurrect();
}

async function firstTime(e) {
  // FIXME: probably should provide an actual error  
  if (isRunning) return;
  
  let url = e.data.url;
  let source = await fetchInput(url);

  library.deleteEverything();
  library.setTexput(source);
  library.setTexputAux(new Uint8Array());
  
  library.setConsoleWriter((x) => {
    postMessage({text: x});
  });

  isRunning = true;
  compile( function (err, dvi) {
    isRunning = false;
    if (err) {
    } else {
      library.setCallback(() => {
        isRunning = false;        
        const filename = 'texput.dvi';
        console.log('Trying to read first-run output...');
        const data = library.readFileSync('texput.dvi');
        const aux = library.readFileSync('texput.aux');
        postMessage({dvi: data.buffer, hsize: library.getHsize()});
      });
      isRunning = true;
      library.resurrect();
      /*
        const aux = library.readFileSync('texput.aux');
        library.deleteEverything();
        library.setTexput(source);
        library.setTexputAux(aux);
      */
      /*
      compile( function (err, dvi) {
        if (err) {
        } else {
          postMessage({dvi: dvi});
        }
      });
      */
    }
  });
}

onmessage = async function(e) {
  if (e.data.hsize)
    library.setHsize( e.data.hsize );

  if (e.data.firstTime)
    firstTime(e);
  else
    recompile(e);
}

  
