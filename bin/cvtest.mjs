#!/usr/bin/env node

const [bin, script, ...args] = process.argv;

import { Test } from "../Test.mjs"
import path from "path";
import fs from 'node:fs';
const fsp = fs.promises;

const getTestList = !args.length
	? fsp.readdir(process.cwd())
	: Promise.resolve(args);

const loadTests = getTestList.then(list => Promise.all(
	list
	.map(entry => entry.match(/(.+Test)\.[cm]?js$/))
	.filter(x=>x)
	.map(entry => [path.basename(entry[1]), process.cwd() + '/' + entry[0]])
	.map(([testName,file]) => import(file).then(t => t[testName]))
));

loadTests.then(tests => Test.run(...tests));



/*
const options = {};
const params  = [];

let i = 2;

for(const arg of process.argv.slice(2))
{

	if(arg == '--')
		break;

	if(arg.length <= 1 || arg[0] !== '-')
		params.push(arg);
		continue;

	if(arg[1] !== '-')
	{
		arg.substr(1).split('').forEach(c => options[c] = true);
		continue;
	}

	const equalPoint = arg.indexOf('=');

	if(equalPoint>0)
	{
		options[arg.substr(2,equalPoint+-2)] = arg.substr(1+equalPoint);
		continue;
	}

	options[arg.substr(2)] = true;
}
*/
