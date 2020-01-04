import * as library from './library';
import pako from 'pako';
import fetchStream from 'fetch-readablestream';
import FS from '@isomorphic-git/lightning-fs';

import kpathsea from './kpathsea';

let pages = 1000;
var coredump;
let code = undefined;

async function load() {
  let tex = await fetch('/tex/out2.wasm');
  code = await tex.arrayBuffer();

  let response = await fetchStream('/tex/core12.dump.gz');
  const reader = response.body.getReader();
  const inf = new pako.Inflate();
  
  try {
    while (true) {
      const {done, value} = await reader.read();
      inf.push(value, done);
      if (done) break;
    }
  }
  finally {
    reader.releaseLock();
  }

  coredump = new Uint8Array( inf.result, 0, pages*65536 );
}

function copy(src)  {
  var dst = new Uint8Array(src.length);
  dst.set(src);
  return dst;
}

self.onmessage = async function (e : any) {
  let repositoryName = e.data.repositoryName;
  let directoryName = e.data.directoryName;
  let pathName = e.data.pathName;
  
  await load();
  
  let memory = new WebAssembly.Memory({initial: pages, maximum: pages});
  
  let buffer = new Uint8Array( memory.buffer, 0, pages*65536 );
  buffer.set( copy(coredump) );

  const fs = new FS(repositoryName);
  library.setFS( fs );
  library.setMemory( memory.buffer );
  let filename = directoryName + '/' + pathName + '.tex';
  //library.setInput( " " + filename + " \n\\end\n" );
  library.setInput( " \\PassOptionsToClass{web}{ximera}\\PassOptionsToPackage{margin=1in,paperwidth=" + (e.data.paperwidth + 144).toString() + "pt,paperheight=100in}{geometry}\n\\input{" + filename + " }\n\\end\n" );
  
  library.setCallback( function() {
    let filename = directoryName + '/' + pathName + '.dvi';
    //let data = library.readFileSync( filename )
    let data = library.readFileSync( 'texput.dvi' );
    self.postMessage({dvi: data}, [data.buffer]);
  });
  
  const compiled = new WebAssembly.Module(code);
  const instance;

  try {
    instance = await WebAssembly.instantiate(compiled, { library: library,
						   env: { memory: memory }
						 });
  } catch (err) {
      console.log(err);
  }
  
  console.log("instance=",instance);
    
  const wasmExports = instance.exports;
  library.setWasmExports( wasmExports );

  console.log( "wasmExports", wasmExports );

  wasmExports.main();
};
