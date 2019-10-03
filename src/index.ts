import 'bootstrap';
import './scss/app.scss';
import * as git from 'isomorphic-git';
import * as pify from 'pify';
import { version } from '../package.json';

const repositoryName = 'mooculus/calculus';

import * as LightningFS from '@isomorphic-git/lightning-fs';

const fs = new LightningFS(repositoryName);
git.plugins.set('fs', fs);
const pfs = fs.promises;
window.pfs = fs.promises;

console.log("This is");
console.log("  ▀██▄   ▄██▀ ██ █████     █████ ▄███████████████████▄    ███");
console.log("    ▀██▄██▀   ██▐██ ▐██   ██▌ ██▌██                 ██▌  ██▀██");
console.log("      ███     ██▐██  ██▌ ▐██  ██▌▐█████████ ▄████████▀  ██▀ ▀██");
console.log("    ▄██▀██▄   ██▐██  ▐██ ██▌  ██▌██        ▐█▌  ▀██▄   ██▀   ▀██");
console.log("  ▄██▀   ▀██▄ ██▐██   ▀███▀   ██▌▀█████████▐█▌    ▀██▄██▀     ▀██");
console.log("version",version);

let directoryName = '/repository';

let worker = new Worker('worker.js');
worker.postMessage('from me!');
worker.postMessage('againfrom me!');


// TODO: factor this out into a webworker
// see https://stackoverflow.com/questions/34851839/how-to-handle-web-workers-standard-syntax-with-webpack
// and also https://isomorphic-git.org/docs/en/webworker
async function cloneRepository() {
    console.log("Cloning...");
    
    await git.clone({
	dir: directoryName,
	corsProxy: 'https://cors.isomorphic-git.org',
	url: 'https://github.com/' + repositoryName,
	ref: 'master',
	singleBranch: true,
	depth: 2
    });
    
    console.log("Cloned!");
}

async function main() {
    try {
	if (await pfs.stat( directoryName )) {
	    console.log( "Already exists" );
	} else {
	    console.log("Could not access it.");
	    await cloneRepository();
	}
    } catch (err) {
	console.log("Directory likely does not exist.");
	await cloneRepository();
    }

    // Now it should not be empty...
    let dump = await pfs.readdir(directoryName);

    console.log( dump );
}

main()
