import 'bootstrap';
import './scss/app.scss';

import * as pify from 'pify';
import { version } from '../package.json';

const repositoryName = 'mooculus/calculus';

import * as git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';

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

let directoryName = '/repository';

function cloneFromGithub( repositoryName : string, directoryName : string, progress : any = undefined ) {
    return new Promise(function(resolve, reject) {
	let worker = new Worker('worker.js');

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
}

main()
