#!/usr/bin/env node

import * as nopt from "nopt";
import * as noptUsage from "nopt-usage";
import * as path from "path";
import * as fs from 'fs';
import { AFRunner } from "./AFRunner";

function run(rootDir: string = './', port: number = null, loglevel: string = null): void {
    let runner: AFRunner = new AFRunner(rootDir);

    if (port) {
        runner.setPort = port;
    }

    if (loglevel) {
        runner.setLogLevel = loglevel;
    }

    runner.start();
}

let options: any = {
    "dir": [String, null],
    "port": Number,
    "loglevel": String,
    "help": String
}

let shortHands: any = {
    "dir": ["--directory", "-d"],
    "port": ["--port", "-p"],
    "loglevel": ["--loglevel", "-l"],
    "help": ["--help", "-h"]
}

let description: any = {
    "dir": "The root directory of azure functions",
    "port": "The port for starting azure functions",
    "loglevel": "The level of logging",
    "help": "Help information"
}

let defaults: any = {
    "dir": "./",
    "port": 3001,
    "loglevel": null,
    "help": null
}

let parsed = nopt(options, shortHands, process.argv, 2);
if (parsed.help !== undefined) {
    console.log('Usage: ');
    console.log(noptUsage(options, shortHands, description, defaults));
}
else {
    let dir: string
    let port: number;

    dir = (!parsed.dir) ? "./" : parsed.dir;
    port = (!parsed.port) ? 3001 : parsed.port;

    if (fs.lstatSync(dir).isDirectory()) {
        dir = path.resolve(dir);
        run(dir, port, parsed.loglevel);
    }
    else {
        console.log('\x1b[31m%s\x1b[0m', "Invalid directory.");
    }
}