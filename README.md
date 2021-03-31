# [tex.rossprogram.org](https://tex.rossprogram.org/)

This is a [live demo](https://tex.rossprogram.org/) of the JavaScript-based TeX compiler and DVI viewer discussed in:

> [J. Fowler, *Both TEX and DVI viewers inside the
web browser*, TUGboat, Volume 40 (2019), No. 1](https://www.tug.org/TUGboat/tb40-1/tb124fowler-js.pdf).

In particular, it uses [web2js](https://github.com/kisonecat/web2js) to compile [Knuth's Pascal TeX source](https://ctan.org/tex-archive/systems/knuth/dist/tex) into WebAssembly, which can then be run in a [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) in the browser.  The texmf hierarchy from [TexLive](https://nixos.wiki/wiki/TexLive) is also served on a web endpoint, and the WebAssembly is instrumented with [asyncify](https://emscripten.org/docs/porting/asyncify.html) so TeX can be interrupted while waiting for files to be fetched from the network.  Finally [dvi2html](https://github.com/kisonecat/dvi2html) is used to convert the resulting dvi into HTML, and an SVG driver is used to support TikZ as well.

The real-time collaborative features are made possible by [ShareDB](https://github.com/share/sharedb), and the [Ace Editor](https://ace.c9.io/) is used with its TeX language support.

# Running development version

Deploy the frontend via `yarn run start` and the backend via `node server/index.js`.

# Similar projects

There are *many* projects which have some overlap with what Ximera does.  Some examples are

* https://github.com/rbeezer/mathbook
* https://github.com/softcover/softcover
* https://github.com/RunestoneInteractive/RunestoneServer
