import * as path from 'path';

async function* makeTextFileLineIterator(fileURL) {
  const utf8Decoder = new TextDecoder('utf-8');
  const response = await fetch(fileURL);
  const reader = response.body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  chunk = chunk ? utf8Decoder.decode(chunk) : '';

  const re = /\n|\r|\r\n/gm;
  let startIndex = 0;
  let result;

  for (;;) {
    let result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '');
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex);
  }
}

async function* makeFilenameIterator(root) {
  var currentDirectory = undefined;

  for await (let line of makeTextFileLineIterator(path.join(root,'ls-R'))) {
    if (line.length == 0) continue;
    
    if (line.startsWith('%')) continue;
    
    // Comments can appear in the database
    if (line.startsWith('%')) continue;

    // If a line begins with ‘/’ or ‘./’ or ‘../’ and ends with a
    // colon, it’s the name of a directory. (‘../’ lines aren’t
    // useful, however, and should not be generated.)
    if ((line.startsWith('/') || line.startsWith('.')) && line.endsWith(':')) {
      currentDirectory = line.slice(0,-1); // remove trailing colon
    } else {
      // All other lines define entries in the most recently seen
      // directory. /’s in such lines will produce possibly-strange
      // results.
      yield path.join(currentDirectory,line);
    }
  }

  return;
}

async function makeDatabase(root) {
  var database = {};

  for await (let filename of makeFilenameIterator(root)) {
    // In Kpathsea version 6.3.0 (released with TeX Live 2018), a new
    // fallback search was implemented on Unix-like systems, including
    // Macs: for each path element in turn, if no match is found by
    // the normal search, and the path element allows for checking the
    // filesystem, a second check is made for a case-insensitive
    // match.
    let f = path.basename(filename).toLowerCase();
    
    if (f in database) {
      database[f].push( filename );
    } else {
      database[f] = [ filename ];
    }
  }
  
  return database;
}

var db = undefined;

export async function findMatch( partialPath ) {
  const root = '/texmf/';

  if (db == undefined)
    db = await makeDatabase(root);

  let matches = db[path.basename(partialPath).toLowerCase()];

  if (matches)
    return matches
    .filter( fullPath => fullPath.toLowerCase().endsWith( partialPath.toLowerCase() ) )
    .map( fullPath => path.join(root,fullPath) )
    .sort(function(a, b){
      return a.length - b.length;
    })[0];
  else
    return undefined;
}
