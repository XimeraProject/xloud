import 'bootstrap';
import './scss/app.scss';

import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas);
dom.i2svg();

import { dvi2html } from 'dvi2html';
import { Writable } from 'stream';

import * as pify from 'pify';
import { version } from '../package.json';

var ps = window.location.pathname.split('/');
let repositoryName = ps.slice(1,3).join('/');
var pathName = ps.slice(3).join('/');
console.log("pathname=",pathName);

console.log("repository=",repositoryName);

console.log("This is\n" +
"  ▀██▄   ▄██▀ ██ █████     █████ ▄███████████████████▄    ███\n" + 
"    ▀██▄██▀   ██▐██ ▐██   ██▌ ██▌██                 ██▌  ██▀██\n" + 
"      ███     ██▐██  ██▌ ▐██  ██▌▐█████████ ▄████████▀  ██▀ ▀██\n" + 
"    ▄██▀██▄   ██▐██  ▐██ ██▌  ██▌██        ▐█▌  ▀██▄   ██▀   ▀██\n" + 
"  ▄██▀   ▀██▄ ██▐██   ▀███▀   ██▌▀█████████▐█▌    ▀██▄██▀     ▀██\n" +
"version",version);

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
  if (div) {
    div.innerHTML = "";
    div.innerHTML = html;
  } else {
    throw 'missing #page on the page';
  }
}

async function main() {
  //let content = await pfs.readFile(texFilename);
  //console.log("filename:",texFilename);
  //let s = new TextDecoder("utf-8").decode(content);
  //document.getElementById('content').innerHTML = s;
  let tex = new Worker('/tex.js'); 
  tex.postMessage( { paperwidth: document.body.clientWidth * 3 / 4,
		     repositoryName: repositoryName,
		     pathName: pathName } );
  
  tex.addEventListener('message', function (msg) {
    displayDvi(msg.data.dvi);
  });
  
}

main()
