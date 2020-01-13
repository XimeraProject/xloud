import * as library from './library';
import pako from 'pako';
import fetchStream from 'fetch-readablestream';
import path from 'path';

import kpathsea from './kpathsea';

let pages = 1500;
var coredump;
let code : ArrayBuffer | SharedArrayBuffer;

async function load() {
  let tex = await fetch('/tex/out.8c3fe3450cb5.wasm');
  code = await tex.arrayBuffer();

  let response = await fetchStream('/tex/core.3c18eb846463.dump.gz');
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

self.onmessage = async function (e : MessageEvent) {
  let repositoryName = e.data.repositoryName;
  let pathName = e.data.pathName;
  
  await load();
  
  let memory = new WebAssembly.Memory({initial: pages, maximum: pages});
  
  let buffer = new Uint8Array( memory.buffer, 0, pages*65536 );
  buffer.set( copy(coredump) );

  library.setUrlRoot( `https://raw.githubusercontent.com/${repositoryName}/master/` );
  
  library.setMemory( memory.buffer );
  let filename = pathName + '.tex';

  library.setDirectory( path.dirname( filename ) );
  
  library.setInput( " \\PassOptionsToClass{web}{ximera}\\PassOptionsToPackage{margin=1in,paperwidth=" + (e.data.paperwidth + 144).toString() + "pt,paperheight=100in}{geometry}\n\\input{" + path.basename( filename ) + "}\n\\end\n" );
  
  library.setCallback( function() {
    let filename = pathName + '.dvi';
    //let data = library.readFileSync( filename )
    let data = library.readFileSync( 'texput.dvi' );
    self.postMessage({dvi: data}, [data.buffer]);
  });
  
  const compiled = new WebAssembly.Module(code);
  let instance;

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
