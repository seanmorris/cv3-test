import fs from 'node:fs';
import path from 'node:path';

const getStack = () => {
	const stackStrings = new Error().stack;

	const stack = stackStrings.split('\n').slice(1).map(line => {
		const columnColon = line.lastIndexOf(':');
		const fileColon = line.lastIndexOf(':', -1 + columnColon);
		const parenClose = line.lastIndexOf(')');
		const parenOpen = line.lastIndexOf('(');
		const file = line.lastIndexOf('file:');
		const at = line.indexOf('at ');

		return {
			file: line.substring(file + 7, fileColon),
			function: parenOpen > -1 ? line.substring(3 + at, -1 + parenOpen) : null,
			line: Number(line.substring(1 + fileColon, columnColon)),
			column: Number(line.substring(1 + columnColon, (parenOpen > -1) ? parenClose : undefined)),
			original: line
		}
	});

	return stack;
};

const getCaller = (depth = 1) => {
	const stack = getStack().slice(1 + depth);
	return stack[0];
};

const indexes = new Map;

const compareDeep = (value, matchers) => {
	if(typeof value === 'object')
	{
		matchers = matchers ?? {};

		Object.entries(matchers).forEach(([key, matcher]) => {
			compareDeep(value[key], matcher) && delete value[key];
		});

		return false;
	}

	if(matchers)
	{
		const matcher = matchers;
		matcher(value);
	}

	return true;
};

export const compareSnapshot = (value, matchers) => {

	const _value = typeof value === 'object' ? {...value} : value;

	const { file: testFilename, function: testMethod } = getCaller(2);
	const index = testFilename + '#' + testMethod;
	const count = indexes.get(index) ?? 0;

	const filename = path.dirname(testFilename) + '/' + testMethod + '_' + count + '.json';
	const json = JSON.stringify(_value, null, 4);

	indexes.set(index, 1 + count);

	if(process.env.CV_UPDATE_SNAPSHOTS || !fs.existsSync(filename))
	{
		fs.writeFileSync(filename, json, {encoding: 'utf8'});
		return true;
	}

	return json === fs.readFileSync(filename, {encoding: 'utf8'});
};
