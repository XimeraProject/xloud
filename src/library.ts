/****************************************************************/
// fake files

interface File {
  filename: string;
  buffer?: Uint8Array;
  position: number;
  erstat: number;
  descriptor?: number;
  stdout?: boolean;
  stdin?: boolean;
  eof?: boolean;
  eoln?: boolean;
}

let filesystem = {};
let files : File[] = [];
let urlRoot = '';

import findMatch from './kpathsea';

export function deleteEverything() {
  files = [];
}

export function writeFileSync( filename, buffer )
{
  filesystem[filename] = btoa(buffer);
}

export function readFileSync( filename )
{
  for( let f of files ) {
    if (f.filename == filename) {
      if (f.buffer)
        return f.buffer.slice( 0, f.position );
      else
        throw Error(`Missing buffer for filename ${f.filename}`);
    }
  }

  throw Error(`Could not find file ${filename}`);
}

let sleeping = false;
function openSync( filename, mode )
{
  console.log("attemptnig to open",filename);

  if (!sleeping) {
    startUnwind();
    sleeping = true;

    findMatch( filename ).then( function (fullFilename) {

      if (filename == 'ximera.cls')
	fullFilename = '/local-texmf/tex/latex/ximeraLatex/ximera.cls';

      if (filename == 'pgfsys-ximera.def')
	fullFilename = '/local-texmf/tex/latex/ximeraLatex/pgfsys-ximera.def';
      
      if (fullFilename) {
	console.log("Found it in ", fullFilename);
	fetch( fullFilename ).then( function( response ) {
	  response.arrayBuffer().then( function( buffer ) {
	    files.push({ filename: filename,
			 position: 0,
			 erstat: 0,
			 buffer: new Uint8Array(buffer),
			 descriptor: files.length
		       });
	    //console.log('called back from web, starting to rewind the stack');
	    startRewind();
	  });
	});
      } else {
	fetch( urlRoot + filename )
          .then( function( response ) {
            if (response.ok) {
	      response.arrayBuffer().then( function( buffer ) {
	        files.push({ filename: filename,
			     position: 0,
			     erstat: 0,
			     buffer: new Uint8Array(buffer),
			     descriptor: files.length
		           });
	        startRewind();              
              } );
            } else {
	      console.log("File does not exist:", filename);
	      
	      files.push({ filename: filename,
			   position: 0,
			   erstat: 0,
			   buffer: new Uint8Array(),
			   descriptor: files.length
		         });
	      startRewind();                          
            }
          }, function(err) {
	    console.log("Network failure fetching", filename);
	    console.log("err:",err);
	      
	    files.push({ filename: filename,
			 position: 0,
			 erstat: 0,
			 buffer: new Uint8Array(),
			 descriptor: files.length
		       });
	    startRewind();                                      
          });
      }
    });
				
  } else {
    stopRewind();
    sleeping = false;

    return files.length - 1;
  }
  
  //  buffer = await fs.readFile(filename);

  /*
  if (filesystem[filename]) {
    buffer = Uint8Array.from(Buffer.from(filesystem[filename], 'base64'));
  }

  if (filename.match(/\.tfm$/)) {
    buffer = Uint8Array.from( tfmData( filename.replace(/\.tfm$/, '' ) ) );
  }
  */
  
}

function closeSync( fd ) {
  // ignore this.
}

function writeSync( file, buffer, pointer = 0, length = buffer.length - pointer )
{
  while (length > file.buffer.length - file.position) {
    let b = new Uint8Array( 1 + file.buffer.length * 2 );
    b.set( file.buffer );
    file.buffer = b;
  }
  
  file.buffer.subarray(file.position).set( buffer.subarray(pointer, pointer+length) );
  file.position += length;
}

function readSync( file, buffer, pointer, length, seek )
{
  if (pointer === undefined) pointer = 0;
  if (length === undefined) length = buffer.length - pointer;

  if (length > file.buffer.length - seek)
    length = file.buffer.length - seek;
  
  buffer.subarray(pointer).set( file.buffer.subarray(seek, seek+length) );

  return length;
}

/****************************************************************/
// fake process.write.stdout

let consoleBuffer = "";

function writeToConsole(x) {
  consoleBuffer = consoleBuffer + x;
  if (consoleBuffer.indexOf("\n") >= 0) {
    let lines = consoleBuffer.split("\n");
    consoleBuffer = lines.pop() || "";
    for( let line of lines ) {
      console.log(line);
    }
  }
}

let process = {
  stdout: {
    write: writeToConsole
  }
};

/****************************************************************/
// setup

let memory : ArrayBuffer | SharedArrayBuffer;
let inputBuffer = '';
let callback = function() { throw Error('callback undefined'); };
let view : Int32Array;

interface Asyncify {
  asyncify_start_unwind(number) : void;
  asyncify_start_rewind(number) : void;
  asyncify_stop_rewind() : void;
  main() : void;
}

let wasmExports : Asyncify;

export function setMemory(m) {
  memory = m;
  view = new Int32Array(m);
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

export function setInput(input) {
  inputBuffer = input;
}

let DATA_ADDR = 900 * 1024*64;
let END_ADDR = 1000 * 1024*64;
let windingDepth = 0;

function startUnwind() {
  if (view) {
    view[DATA_ADDR >> 2] = DATA_ADDR + 8;
    view[DATA_ADDR + 4 >> 2] = END_ADDR;
  }
  
  wasmExports.asyncify_start_unwind(DATA_ADDR);
  windingDepth = windingDepth + 1;
}

function startRewind() {
  wasmExports.asyncify_start_rewind(DATA_ADDR);
  wasmExports.main();
  if (windingDepth == 0) {
    callback();
  }
}

function stopRewind() {
  windingDepth = windingDepth - 1;  
  wasmExports.asyncify_stop_rewind();
}

/****************************************************************/
// provide time back to tex

export function getCurrentMinutes() {
  let d = (new Date());
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
  let file = (descriptor < 0) ? {stdout:true} : files[descriptor];
  let length = new Uint8Array( memory, x, 1 )[0];
  let buffer = new Uint8Array( memory, x+1, length );
  let string = String.fromCharCode.apply(null, Array.from(buffer));

  if (file.stdout) {
    process.stdout.write(string);
    return;
  }
  
  writeSync( file, Buffer.from(string) );    
}
  
export function printBoolean(descriptor, x) {
    let file = (descriptor < 0) ? {stdout:true} : files[descriptor];    

    let result = x ? "TRUE" : "FALSE";

    if (file.stdout) {
      process.stdout.write(result);
      return;
    }

  writeSync( file, Buffer.from(result) );    
}
export function printChar(descriptor, x) {
  let file = (descriptor < 0) ? {stdout:true} : files[descriptor];        
  if (file.stdout) {
    process.stdout.write(String.fromCharCode(x));
    return;
  }
  
  let b = Buffer.alloc(1);
  b[0] = x;
  writeSync( file, b );
}

export function printInteger(descriptor, x) {
  let file = (descriptor < 0) ? {stdout:true} : files[descriptor];            
  if (file.stdout) {
    process.stdout.write(x.toString());
    return;
  }

  writeSync( file, Buffer.from(x.toString()));
}

export function printFloat(descriptor, x) {
  let file = (descriptor < 0) ? {stdout:true} : files[descriptor];                
  if (file.stdout) {
    process.stdout.write(x.toString());
    return;
  }

  writeSync( file, Buffer.from(x.toString()));
}

export function printNewline(descriptor, x) {
  let file = (descriptor < 0) ? {stdout:true} : files[descriptor];
  
  if (file.stdout) {
    process.stdout.write("\n");
    return;
  }

  writeSync( file, Buffer.from("\n"));
}

export function reset(length, pointer) {
  let buffer = new Uint8Array( memory, pointer, length );
  let filename = String.fromCharCode.apply(null, Array.from(buffer));

  filename = filename.replace(/ +$/g,'');
  filename = filename.replace(/^\*/,'');    
  filename = filename.replace(/^TeXfonts:/,'');    

  if (filename == 'TeXformats:TEX.POOL')
    filename = "tex.pool";

  if (filename == "TTY:") {
    files.push({ filename: "stdin",
                 stdin: true,
                 position: 0,
                 erstat: 0
               });
    return files.length - 1;
  }
  
  return openSync(filename,'r');
}

export function rewrite(length, pointer) {
  let buffer = new Uint8Array( memory, pointer, length );
  let filename = String.fromCharCode.apply(null, Array.from(buffer));    
  
  filename = filename.replace(/ +$/g,'');    
  
  if (filename == "TTY:") {
    files.push({ filename: "stdout",
                 stdout: true,
                 position: 0,
                 erstat: 0,                   
               });
    return files.length - 1;
  }
  
  return openSync(filename, 'w');
}

export function close(descriptor) {
    let file = files[descriptor];

    if (file.descriptor)
      closeSync( file.descriptor );
}

export function eof(descriptor) {
    let file = files[descriptor];
    
    if (file.eof)
      return 1;
    else
      return 0;
}

export function erstat(descriptor) {
    let file = files[descriptor];
    return file.erstat;
}

export function eoln(descriptor) {
    let file = files[descriptor];

    if (file.eoln)
      return 1;
    else
      return 0;
}
    
export function get(descriptor, pointer, length) {
  let file = files[descriptor];

  let buffer = new Uint8Array( memory );
    
  if (file.stdin) {
    if (file.position >= inputBuffer.length) {
      buffer[pointer] = 13;
      file.eof = true;
      file.eoln = true;
    } else
      buffer[pointer] = inputBuffer[file.position].charCodeAt(0);
  } else {
    if (file.descriptor) {
      if (readSync( file, buffer, pointer, length, file.position ) == 0) {
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
  }
  
  file.eoln = false;
  if (buffer[pointer] == 10)
    file.eoln = true;
  if (buffer[pointer] == 13)
    file.eoln = true;
  
  file.position = file.position + length;
}

export function put(descriptor, pointer, length) {
  let file = files[descriptor];
  
  let buffer = new Uint8Array( memory );

  writeSync( file, buffer, pointer, length );
}
