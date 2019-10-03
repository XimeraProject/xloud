console.log("WEB WORKER: launched!");

onmessage = function(e) {
    console.log('WEB WORKER: received',e);
    //postMessage(workerResult);
}
