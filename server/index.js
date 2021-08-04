#!/usr/bin/env node

import http from 'http';
import express from 'express';
import * as github from './github.js';
import expressStaticGzip from "express-static-gzip";

import dotenv from 'dotenv'
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

var app = express();

import morgan from 'morgan';
app.use(morgan('combined'))

let optionsStatic = {
  immutable: true,
  maxAge: 365 * 24 * 60 * 60 * 1000
};


// This is not hashed, but who cares if the favicon is immutable
app.use('/favicon.ico', express.static(path.resolve(__dirname, '../public/favicon/favicon.ico'), optionsStatic ));

// FIXME: how should this be cached?
// Welp, doesn't matter, because I'm not using this anymore.
// app.use('/local-texmf', express.static(path.resolve(__dirname, '../local-texmf')));

app.get('/', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

/*
app.use('/', expressStaticGzip(path.resolve(__dirname, '../dist'), { index: false,
								     serveStatic: optionsStatic }));
*/

app.use(express.static(path.resolve(__dirname, '../dist'), optionsStatic ));

app.use(`/${process.env.TEXLIVE_VERSION}/texmf`,
	express.static(process.env.TEXMF, optionsStatic) );

// FIXME: get repo information
app.get('/github/:owner/:repo.json', github.findRepository, github.getRepository );

// FIXME: should include some rate-limiting
app.get('/github/:owner/:repo/:commit([0-9a-f]{40})/:path(*.tex)', github.findRepository, github.get );
app.get('/github/:owner/:repo/:commit([0-9a-f]{40})/:path(*.sty)', github.findRepository, github.get );
app.get('/github/:owner/:repo/:commit([0-9a-f]{40})/:path(*.dvi)', github.findRepository, github.get );
app.get('/github/:owner/:repo/:commit([0-9a-f]{40})/:path(*.png)', github.findRepository, github.get );
app.get('/github/:owner/:repo/:commit([0-9a-f]{40})/:path(*.*)', github.findRepository, github.get );

// FIXME: should send 'isomorphic' content
app.get('*', function (request, response) {
  console.log('extra');
  response.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

let port = process.env.PORT;
var server = http.createServer(app);
server.listen(port);
console.log('Listening on http://localhost:' + port.toString());
