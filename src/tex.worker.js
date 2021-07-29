import texCorePath from '../tex/core.1dd006831634.dump.gz';
import texBinaryPath from '../tex/out.65aa873359a6.wasm';
import * as library from './library.js';

let pages = 2500;

var coredump = undefined;
var code;
let compiled;

var theTerminal;
var editor;

import pako from 'pako';
import { ReadableStream } from "web-streams-polyfill";
import fetchStream from 'fetch-readablestream';

let isRunning = false;

async function load() {
  if (!code) {
    let tex = await fetch(texBinaryPath, {cache: "force-cache"});
    postMessage({text: "."});
    code = await tex.arrayBuffer();
  }

  /*
  const codeDigest = await crypto.subtle.digest('SHA-256', code);
  const hashArray = Array.from(new Uint8Array(codeDigest));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  console.log('sha256(code)=',hashHex);
  */
  
  compiled = new WebAssembly.Module(code);
  postMessage({text: "."});

  // This is assuming the server can serve this file as a static gzip
  // comprssed asset.  My timings suggest this is about a third faster
  // than using pako and fetchStream.
  /*
  if (!coredump) {  
    let response = await fetch(texCorePath.replace(/.gz$/,''));
   //                            {cache: "force-cache"});
    coredump = new Uint8Array( await response.arrayBuffer() );
  }
  */

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
  
  return coredump;

  /*
  const digest = await crypto.subtle.digest('SHA-256', coredump);
  const hashArray2 = Array.from(new Uint8Array(digest));                     // convert buffer to byte array
  const hashHex2 = hashArray2.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  console.log('sha256(dump)=',hashHex2);  
  */
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
    console.log('fetching from',url);
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

  // FIXME: should kill the backups too
  library.deleteEverything();
  library.setUrlRoot(url);
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
        const data = library.readFileSync('texput.dvi');
        const aux = library.readFileSync('texput.aux');
        postMessage({dvi: data.buffer, hsize: library.getHsize()});
      });
      isRunning = true;
      library.resurrect();
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

  
