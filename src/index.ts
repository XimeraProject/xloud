import 'bootstrap';
import './scss/app.scss';

import { dvi2html } from 'dvi2html';
import { Writable } from 'stream';

import * as pify from 'pify';
import { version } from '../package.json';

var ps = window.location.pathname.split('/');
let repositoryName = ps.slice(1,3).join('/');
var pathName = ps.slice(3).join('/');
console.log("pathname=",pathName);

import * as git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';

console.log("repository=",repositoryName);
const fs = new FS(repositoryName);
git.plugins.set('fs', fs);

const pfs = fs.promises;

console.log("This is");
console.log("  ▀██▄   ▄██▀ ██ █████     █████ ▄███████████████████▄    ███");
console.log("    ▀██▄██▀   ██▐██ ▐██   ██▌ ██▌██                 ██▌  ██▀██");
console.log("      ███     ██▐██  ██▌ ▐██  ██▌▐█████████ ▄████████▀  ██▀ ▀██");
console.log("    ▄██▀██▄   ██▐██  ▐██ ██▌  ██▌██        ▐█▌  ▀██▄   ██▀   ▀██");
console.log("  ▄██▀   ▀██▄ ██▐██   ▀███▀   ██▌▀█████████▐█▌    ▀██▄██▀     ▀██");
console.log("version",version);

import { findMatch } from './kpathsea';
window.findMatch = findMatch;

let directoryName = '/repository2';

function cloneFromGithub( repositoryName : string, directoryName : string, progress : any = undefined ) {
    return new Promise(function(resolve, reject) {
	let worker = new Worker('/worker.js');

	worker.addEventListener('message', function(e) {
	    if (e.data.message == 'progress') {
		if (progress)
		    progress( e.data.progress );
	    }
	    
	    if (e.data.message == 'cloned') {
		resolve();
	    }

	    if (e.data.message == 'error') {
		reject(e.data.error);
	    }
	});
	
	worker.postMessage( { repositoryName: repositoryName,
			      directoryName: directoryName } );
    });
}

async function displayDvi(dvi) {
  let html = "";  
  const page = new Writable({
    write(chunk, encoding, callback) {
      html = html + chunk.toString();
      callback();
    }
  });
  
  async function* streamBuffer() {
    yield Buffer.from(dvi);
    return;
  }  
  
  let machine = await dvi2html( streamBuffer(), page );
  var div = document.getElementById('page');
  div.innerHTML = "";
  div.innerHTML = html;
}

async function main() {
  try {
    if (await pfs.stat( directoryName )) {
      console.log( "Already exists" );
    } else {
      console.log("Could not access it.");
      await cloneFromGithub( repositoryName, directoryName );
    }
  } catch (err) {
    console.log("Directory likely does not exist.");
    
    try {
      await cloneFromGithub( repositoryName, directoryName );
    } catch (err) {
      console.log("Could not clone: ",err);
    }
  }
  
  // Now it should not be empty...
  let dump = await pfs.readdir(directoryName);
  console.log( dump );
  
  try {
    let content = await pfs.readFile(directoryName + '/' + pathName + '.tex');
    console.log("filename:",directoryName + '/' + pathName + '.tex');
    let s = new TextDecoder("utf-8").decode(content);
    //document.getElementById('content').innerHTML = s;
    let tex = new Worker('/tex.js'); 
    tex.postMessage( { paperwidth: document.body.clientWidth * 3 / 4,
		       repositoryName: repositoryName,
		       directoryName: directoryName,
		       pathName: pathName } );
    
    tex.addEventListener('message', function (msg) {
      displayDvi(msg.data.dvi);
    });

  } catch (err) {
    console.log("Could not find file: ",err);
  }
  
  
}

main()
