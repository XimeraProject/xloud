import * as git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';

////////////////////////////////////////////////////////////////
import EventEmitter from 'events';
const emitter = new EventEmitter();

emitter.on('message', function(message) {
    console.log("git:",message);
});

emitter.on('progress', function(progress) {
    console.log("git:",progress);
    let percent = Math.floor(100 * progress.loaded / progress.total) + '%';
    self.postMessage({ message: 'progress', progress: progress });
});

git.plugins.set('emitter', emitter);

////////////////////////////////////////////////////////////////
console.log("git: worker launched");

self.onmessage = async function (e : any) {
    let repositoryName = e.data.repositoryName;
    let directoryName = e.data.directoryName;

    const fs = new FS(repositoryName);
    git.plugins.set('fs', fs);

    console.log("git: cloning " + repositoryName + "...");

    try {
	await git.clone({
	    dir: directoryName,
	    corsProxy: 'https://cors.isomorphic-git.org',
	    url: 'https://github.com/' + repositoryName,
	    ref: 'master',
	    singleBranch: true,
	    depth: 2
	});
    } catch (err) {
	console.log("git: failed to clone " + repositoryName);
	console.log("git: ",err);
	self.postMessage({ message: 'error', error: err.toString() });
	self.close();
    }
    
    console.log("git: cloned " + repositoryName + "!");
    self.postMessage({ message: 'cloned' });
    self.close();
};
