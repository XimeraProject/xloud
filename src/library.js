import path from 'path';

import Kpathsea from '@ximeraproject/kpathsea';
import lsr from './lsr.json';

const kpathsea = new Kpathsea.default({ db: lsr });

async function findMatch(partialPath) {
  if (kpathsea) return kpathsea.findMatch(partialPath);
  return undefined;
}

/****************************************************************/
// fake files

let files = [];
let filesBackup = [];
let urlRoot = '';
let currentDirectory = '';
let texput;
let texputaux = undefined;
let texliveVersion;
let hsize = 6.5*72;

export function deleteEverything() {
  files = [];
}

export function snapshotFiles() {
  filesBackup = [];
  
  for (const f of files) {
    let c = {...f};
    if (c.buffer)
      c.buffer = new Uint8Array(f.buffer);
    if (c.content)
      c.content = new Uint8Array(f.content);
    
    filesBackup.push(c);
  }

  return;
}

export function restoreFiles() {
  files = [];
  
  for (const f of filesBackup) {
    let c = {...f};
    if (c.buffer)
      c.buffer = new Uint8Array(f.buffer);
    if (c.content)
      c.content = new Uint8Array(f.content);
    
    files.push(c);
  }

  return;
}

export function setTexliveVersion(v) {
  texliveVersion = v;
}

export async function download(url) {
  console.log('in downloading from',url);
  const request = new Request(url);  
  const response = await fetch(request);
  const buffer = response.arrayBuffer();
  return buffer;
}

export async function download2(url) {
  try {
    let cache = await self.caches.open(texliveVersion);
    const request = new Request(url);

    let response = await cache.match(request);
    console.log('responhse=',response);
    
    let buffer;
    if (response === undefined) {
      response = await fetch(request);
      buffer = response.clone().arrayBuffer();
      cache.put(request, response);
    } else {
      buffer = response.arrayBuffer();
    }

    return buffer;
  }
  catch (err) {
    console.log(err);
    return new ArrayBuffer();
  }
}

export function setHsize(s) {
  hsize = s;
}

export function getHsize() {
  return hsize;
}

export function setTexput(buffer) {
  if (typeof buffer === 'string') {
    let encoder = new TextEncoder();
    texput = encoder.encode(buffer);
    return;
  }
  
  texput = Uint8Array.from(buffer);
}

export function setTexputAux(buffer) {
  if (typeof buffer === 'string') {
    let encoder = new TextEncoder();
    texputaux = encoder.encode(buffer);
    return;
  }

  texputaux = buffer;
}

export function writeFileSync(filename, buffer) {
  files.push({
    filename,
    position: 0,
    erstat: 0,
    buffer: new Uint8Array(buffer),
    descriptor: files.length,
  });
}

export function readFileSync(filename) {
  for (const f of files) {
    if (f.filename == filename) {
      if (f.position != 0) {
        if (f.buffer) return f.buffer.slice(0, f.position);
        throw Error(`Missing buffer for filename ${f.filename}`);
      }
    }
  }

  throw Error(`Could not find file ${filename}`);
}

let texmf = {};

async function openFromGithub( filename, mode ) {
  console.log('github',urlRoot,filename);
  let resolved = path.resolve( path.dirname(urlRoot), filename );
  console.log('github resolved',resolved);
  
  const request = new Request(resolved);
  const response = await fetch(request);
  
  if (response.ok && (response.status === 200)) {
    const buffer = await response.arrayBuffer();
    
    files.push({
      filename,
      position: 0,
      position2: 0,                                     
      erstat: 0,
      buffer: new Uint8Array(buffer),
      descriptor: files.length,
    });
    startRewind();
    return;
  }
      
  files.push({
    filename,
    position: 0,
    position2: 0,                                   
    erstat: (mode == 'r') ? 1 : 0,
    buffer: new Uint8Array(),
    descriptor: files.length,
  });
  startRewind();  
  return;  
}

let sleeping = false;
let snapshotting = false;
let snapshotted = false;

function openSync(filename, mode) {
  console.log('attempting to open', filename, 'in mode', mode);
  console.log(filename);
  
  // FIXME: this seems like a bug with TeXlive?
  if (filename.startsWith('"')) {
    filename = filename.replace(/"/g, '');
  }

  if (filename === 'texput.aux') {
    let buffer = new Uint8Array();
    if (texputaux) {
      buffer = new Uint8Array(texputaux);
    }
    
    files.push({
      filename,
      position: 0,
      position2: 0,                               
      erstat: 0,
      buffer: buffer,
      descriptor: files.length,
    });
    console.log('opened with handle',files.length - 1);
    return files.length - 1;
  }

  if (filename === 'texput.dvi') {
    files.push({
      filename,
      position: 0,
      position2: 0,
      erstat: 0,
      buffer: new Uint8Array(),
      descriptor: files.length,
    });
    console.log('opened with handle',files.length - 1);
    return files.length - 1;
  }

  if (filename === 'texput.tex') {
    files.push({
      filename,
      position: 0,
      position2: 0,                               
      erstat: 0,
      buffer: new Uint8Array(texput),
      descriptor: files.length,
    });
    console.log('opened with handle',files.length - 1);
    return files.length - 1;
  }

  if (filename === 'texput.log') {
    files.push({
      filename,
      position: 0,
      position2: 0,                               
      erstat: 0,
      buffer: new Uint8Array(),
      descriptor: files.length,
    });
    console.log('opened with handle',files.length - 1);
    return files.length - 1;
  }

  if (!sleeping) {
    if (texmf[filename]) {
      files.push({
        filename,
	position: 0,
        position2: 0,                                     
	erstat: 0,
	buffer: new Uint8Array(texmf[filename]),
	descriptor: files.length,
      });
      return files.length - 1;
    }
    
    startUnwind();
    sleeping = true;
    
    findMatch(filename).then((fullFilename) => {

      if (filename == 'pgfsys-ximera.def') fullFilename = '/local-texmf/tex/latex/ximeraLatex/pgfsys-ximera.def';
      if (filename == 'ximera.cls') fullFilename = '/local-texmf/tex/latex/ximeraLatex/ximera.cls?' + Date.now();

      console.log('looking up', filename,'as',fullFilename);
      
      if (fullFilename) {
        if (fullFilename.startsWith('/texmf'))
          fullFilename = '/' + texliveVersion + fullFilename;
        
	console.log('Found it in ', fullFilename);

        if (texmf[filename]) {
	  files.push({
            filename,
	    position: 0,
            position2: 0,                                     
	    erstat: 0,
	    buffer: new Uint8Array(texmf[filename]),
	    descriptor: files.length,
	  });
          startRewind();
        } else {
          console.log('downloading from',fullFilename);
	  download(fullFilename).then((buffer) => {
	    files.push({
              filename,
	      position: 0,
              position2: 0,                                     
	      erstat: 0,
	      buffer: new Uint8Array(buffer),
	      descriptor: files.length,
	    });

	    startRewind();
	  }).catch((error) => {
            console.error(error);
            console.log('Missing file', filename);
	      
	    files.push({
              filename,
	      position: 0,
              position2: 0,                                     
	      erstat: (mode == 'r') ? 1 : 0,
	      buffer: new Uint8Array(),
	      descriptor: files.length,
	    });
	    startRewind();
          });
        }
      } else {
	console.log('File does not exist:', filename);

        openFromGithub(filename, mode);        
      }
    });
  } else {
    stopRewind();
    sleeping = false;

    return files.length - 1;
  }
}

function closeSync(fd) {
  // ignore this.
}

function writeSync(file, buffer, pointer = 0, length = buffer.length - pointer) {
  while (length > file.buffer.length - file.position) {
    const b = new Uint8Array(1 + file.buffer.length * 2);
    b.set(file.buffer);
    file.buffer = b;
  }
  
  file.buffer.subarray(file.position).set(buffer.subarray(pointer, pointer + length));
  file.position += length;
}

function readSync(file, buffer, pointer, length, seek) {
  if (pointer === undefined) pointer = 0;
  if (length === undefined) length = buffer.length - pointer;

  if (length > file.buffer.length - seek) length = file.buffer.length - seek;
  
  buffer.subarray(pointer).set(file.buffer.subarray(seek, seek + length));

  return length;
}

/****************************************************************/
// fake process.write.stdout

let consoleBuffer = '';

function writeToConsole(x) {
  consoleBuffer += x;
  if (consoleBuffer.indexOf('\n') >= 0) {
    const lines = consoleBuffer.split('\n');
    consoleBuffer = lines.pop() || '';
    for (const line of lines) {
      console.log(line);
    }
  }
}

const process = {
  stdout: {
    write: writeToConsole,
  },
};

/****************************************************************/
// setup

let memory;
let memoryBackup;
let inputBuffer = '';
let callback = function () { throw Error('callback undefined'); };
let view;

let wasmExports;

export function setDirectory(d) {
  currentDirectory = d;
}

export function setMemory(m) {
  memory = m;
  view = new Int32Array(m);
}

export function setMemoryBackup(m) {
  memoryBackup = m;
}

export function setWasmExports(m) {
  wasmExports = m;
}

export function setUrlRoot(u) {
  urlRoot = u;
}

export function setCallback(cb) {
  callback = cb;
}

export function setConsoleWriter(cb) {
  process.stdout.write = cb;
}

export function setInput(input) {
  if (typeof input === 'string') {
    let encoder = new TextEncoder();
    inputBuffer = encoder.encode(input);
    return;
  }
  
  inputBuffer = input;
}

const DATA_ADDR = 900 * 1024 * 64;
const END_ADDR = 1000 * 1024 * 64;
let windingDepth = 0;

function startUnwind() {
  if (view) {
    view[DATA_ADDR >> 2] = DATA_ADDR + 8;
    view[DATA_ADDR + 4 >> 2] = END_ADDR;
  }
  
  wasmExports.asyncify_start_unwind(DATA_ADDR);
  windingDepth += 1;
}

function startRewind() {
  wasmExports.asyncify_start_rewind(DATA_ADDR);
  
  wasmExports.main();
  
  if (windingDepth == 0) {
    callback();
  }
}

function stopRewind() {
  windingDepth -= 1;  
  wasmExports.asyncify_stop_rewind();
}

/****************************************************************/
// provide time back to tex

export function getCurrentMinutes() {
  const d = (new Date());
  return 60 * (d.getHours()) + d.getMinutes();
}
  
export function getCurrentDay() {
  return (new Date()).getDate();
}
  
export function getCurrentMonth() {
  return (new Date()).getMonth() + 1;
}
  
export function getCurrentYear() {
  return (new Date()).getFullYear();    
}

/****************************************************************/
// print

export function printString(descriptor, x) {
  const file = (descriptor < 0) ? { stdout: true } : files[descriptor];
  const length = new Uint8Array(memory, x, 1)[0];
  const buffer = new Uint8Array(memory, x + 1, length);
  const string = String.fromCharCode.apply(null, Array.from(buffer));

  if (file.stdout) {
    process.stdout.write(string);
    return;
  }
  
  writeSync(file, buffer);
}
  
export function printBoolean(descriptor, x) {
    const file = (descriptor < 0) ? { stdout: true } : files[descriptor];    

    const result = x ? 'TRUE' : 'FALSE';

    if (file.stdout) {
      process.stdout.write(result);
      return;
    }

  writeSync(file, Uint8Array.from(result));    
}
export function printChar(descriptor, x) {
  const file = (descriptor < 0) ? { stdout: true } : files[descriptor];        
  if (file.stdout) {
    process.stdout.write(String.fromCharCode(x));
    return;
  }
  
  const b = Uint8Array.from([x]);
  writeSync(file, b);
}

export function printInteger(descriptor, x) {
  const file = (descriptor < 0) ? { stdout: true } : files[descriptor];            
  if (file.stdout) {
    process.stdout.write(x.toString());
    return;
  }

  writeSync(file, Uint8Array.from(x.toString()));
}

export function printFloat(descriptor, x) {
  const file = (descriptor < 0) ? { stdout: true } : files[descriptor];                
  if (file.stdout) {
    process.stdout.write(x.toString());
    return;
  }

  writeSync(file, Uint8Array.from(x.toString()));
}

export function printNewline(descriptor, x) {
  const file = (descriptor < 0) ? { stdout: true } : files[descriptor];
  
  if (file.stdout) {
    process.stdout.write('\n');
    return;
  }

  writeSync(file, Uint8Array.from([10]));
}

export function reset(length, pointer) {
  const buffer = new Uint8Array(memory, pointer, length);
  let filename = String.fromCharCode.apply(null, Array.from(buffer));

  filename = filename.replace(/ +$/g, '');
  filename = filename.replace(/^\*/, '');    
  filename = filename.replace(/^TeXfonts:/, '');    

  if (filename == 'TeXformats:TEX.POOL') filename = 'tex.pool';

  if (filename == 'TTY:') {
    files.push({
      filename: 'stdin',
      stdin: true,
      position: 0,
      position2: 0,      
      erstat: 0,
    });
    return files.length - 1;
  }
  
  return openSync(filename, 'r');
}

export function rewrite(length, pointer) {
  const buffer = new Uint8Array(memory, pointer, length);
  let filename = String.fromCharCode.apply(null, Array.from(buffer));    
  
  filename = filename.replace(/ +$/g, '');    
  
  if (filename == 'TTY:') {
    files.push({
 filename: 'stdout',
                 stdout: true,
                 position: 0,
                 erstat: 0,                   
               });
    return files.length - 1;
  }
  
  return openSync(filename, 'w');
}

export function close(descriptor) {
    const file = files[descriptor];

    if (file.descriptor) closeSync(file.descriptor);
}

export function eof(descriptor) {
    const file = files[descriptor];
    
    if (file.eof) return 1;
    return 0;
}

export function erstat(descriptor) {
    const file = files[descriptor];
    return file.erstat;
}

export function eoln(descriptor) {
    const file = files[descriptor];

    if (file.eoln) return 1;
    return 0;
}
    
export function get(descriptor, pointer, length) {
  const file = files[descriptor];

  const buffer = new Uint8Array(memory);
    
  if (file.stdin) {
    if (file.position >= inputBuffer.length) {
      buffer[pointer] = 13;
      file.eof = true;
      file.eoln = true;
    } else buffer[pointer] = inputBuffer[file.position];//.charCodeAt(0);
  } else if (file.descriptor) {
      if (readSync(file, buffer, pointer, length, file.position) == 0) {
        buffer[pointer] = 0;
        file.eof = true;
        file.eoln = true;
        return;
      }
    } else {
      file.eof = true;
      file.eoln = true;        
      return;
    }
  
  file.eoln = false;
  if (buffer[pointer] == 10) file.eoln = true;
  if (buffer[pointer] == 13) file.eoln = true;
  
  file.position += length;
}

export function put(descriptor, pointer, length) {
  const file = files[descriptor];
  
  const buffer = new Uint8Array(memory);

  writeSync(file, buffer, pointer, length);
}

export function getfilesize(length, pointer) {
  var buffer = new Uint8Array( memory, pointer, length );
  var filename = String.fromCharCode.apply(null, buffer);

  if (filename.startsWith('expl3.sty'))
    return 6208;
  if (filename.startsWith('l3backend-dvips.def'))
    return 33684; 

  return 0;
}

let windingBackup;
let stackPointer = 0;

export function resurrect() {
  if (!snapshotted) {
    console.log('nothing to resurrect');    
    return;
  }
  
  console.log('attempting to resurrect');
  var uint32View = new Uint32Array(memoryBackup);

  view.set( uint32View );

  restoreFiles();
  windingDepth = windingBackup;
  snapshotting = true;

  console.log('AGAIN starting rewind and copying');

  wasmExports.setStackPointer(stackPointer);
  wasmExports.asyncify_start_rewind(DATA_ADDR);
  
  wasmExports.main();
  console.log('exited main');
  wasmExports.asyncify_stop_unwind();   
}

export function snapshot() {
  console.log('in snapshot');
  snapshotted = true;
  
  if (!snapshotting) {
    console.log('starting unwind');
    snapshotting = true;

    startUnwind();

    setTimeout(function() {
      console.log('starting rewind and copying');

      windingBackup = windingDepth;

      var uint32View = new Uint32Array(memoryBackup);
      uint32View.set( view );
      snapshotFiles();
      console.log(files);
      console.log(filesBackup);      

      stackPointer = wasmExports.getStackPointer();
      console.log('SP=',stackPointer);
      
      wasmExports.asyncify_start_rewind(DATA_ADDR);
      wasmExports.main();
    }, 1);
  } else {
    console.log('stop rewind!');
    stopRewind();
    snapshotting = false;
  }

  console.log('-snapshot-');
  return 1;
}

export function inputln(descriptor, bypass_eoln, bufferp, firstp, lastp, max_buf_stackp, buf_size) {
  var file = files[descriptor];
  var last_nonblank = 0; // |last| with trailing blanks removed

    var buffer = new Uint8Array( memory, bufferp, buf_size);
    var first = new Uint32Array( memory, firstp, 1 );
    var last = new Uint32Array( memory, lastp, 1 );
    // FIXME: this should not be ignored
    var max_buf_stack = new Uint32Array( memory, max_buf_stackp, 1 );

  if (file.stdin) {
    file.buffer = inputBuffer;
  }

  if (file.content === undefined) 
    file.content = Uint8Array.from(file.buffer);
  
    // cf.\ Matthew 19\thinspace:\thinspace30
    last[0] = first[0];

    // input the first character of the line into |f^|
    if (bypass_eoln) {
      if (!file.eof) {
        if (file.eoln) {
          file.position2 = file.position2 + 1;
        }
      }
    }

    let endOfLine = file.content.indexOf(10, file.position2);
    if (endOfLine < 0) endOfLine = file.content.length;
      
    if (file.position2 >= file.content.length) {
      if (file.stdin) {
        console.log('reached end of input');
        if (callback) callback();
      }
      
      file.eof = true;
      return false;
    } else {
      let src = file.content.slice( file.position2, endOfLine );
      buffer.set( src, first[0] );
      var bytesCopied = src.length;
      
      last[0] = first[0] + bytesCopied;
      
      while( buffer[last[0] - 1] == 32 )
        last[0] = last[0] - 1;
      
      file.position2 = endOfLine;
      file.eoln = true;
    }
    
    return true;
}

export function evaljs(str_number, str_poolp, str_startp, pool_ptrp, pool_size, max_strings,
                       eqtbp,active_base,eqtb_size,count_base) {
    var str_start = new Uint32Array( memory, str_startp, max_strings+1);
    var pool_ptr = new Uint32Array( memory, pool_ptrp, 1);
    var str_pool = new Uint8Array( memory, str_poolp, pool_size+1);
    var length = str_start[str_number+1] - str_start[str_number];
    var input = new Uint8Array( memory, str_poolp + str_start[str_number], length );
    var string = new TextDecoder("ascii").decode(input);

    var count = new Uint32Array( memory, eqtbp + 8*(count_base - active_base), 512 );
    
    const handler = {
      get: function(target, prop, receiver) {
        return target[2*prop];
      },
      set: function(target, prop, value) {
        target[2*prop] = value;
      }
    };    

    var tex = {
      print: function(s) {
        const encoder = new TextEncoder('ascii');
        const view = encoder.encode(s);
        const b = Uint8Array.from(view);
        str_pool.set( b, pool_ptr[0] );
        pool_ptr[0] += view.length;
      },
      count: new Proxy(count, handler),
      hsize: hsize,
    };

    var f = Function(['tex'],string);
    f(tex);
}
  
  
