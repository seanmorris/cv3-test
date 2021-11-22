#!/usr/bin/env node

const [bin, script, ...args] = process.argv;

const Test = require("../Test").Test;
const fsp  = require("fs").promises;

if(!args.length)
{
	fsp.readdir(process.cwd()).then(list => Test.run(
		...list
		.map(entry => entry.match(/(.+Test)\.js$/))
		.filter(x=>x)
		.map(entry => [entry[1], process.cwd() + '/' + entry[0]])
		.map(([entry, file]) => require(file)[entry])
	));
}
else
{
	Test.run(
		...args
		.map(entry => entry.match(/(.+Test)\.js$/))
		.filter(x=>x)
		.map(entry => [entry[1], process.cwd() + '/' + entry[0]])
		.map(([entry, file]) => require(file)[entry])
	);
}
