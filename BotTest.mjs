import { Pobot } from 'pobot/Pobot.mjs';
import { Test } from './Test.mjs';

import { Console } from 'node:console';
import fs from 'node:fs';
import path from 'node:path';

const Delay = timeout => new Promise(accept => setTimeout(accept, timeout));

const fsp = fs.promises;

const pendingRequests = new Set;
const pendingPrintLog = new Set;

const konsole = new Console({stdout: process.stderr, stderr: process.stderr});

export class BotTest extends Test
{
	setUpTime = null;
	loadStartDocument = null;

	startDocument = `about:blank`;

	width = 640;
	height = 960;

	options = [];

	helpers = [];
	_helpers = [
		{ modules: [] },
		{
			inits: [
				() => {
					const o = console.assert;
					const assert = (...a) => {
						(window.externalAssert||o)(JSON.stringify(a));
						o(...a);
					};
					window.console.assert = assert;
				},
				() => {
					window.pobot = {
						type: (...a) => window.externalPobotType(JSON.stringify(a)),
						click: (...a) => window.externalPobotClick(JSON.stringify(a)),
						scrollBy: (...a) => window.externalPobotScrollBy(JSON.stringify(a)),
						scrollTo: (...a) => window.externalPobotScrollTo(JSON.stringify(a)),
						getScreenshot: (...a) => window.getScreenshot(JSON.stringify(a)),
					};
				},
				() => {
					window.Delay = d => new Promise(a => setTimeout(a, d));
				}
			],
			bindings: {
				externalAssert: (...a) => this.assertSilent(...a),
				externalPobotType: (...a) => this.pobot.type(...a),
				externalPobotScrollBy: (...a) => this.pobot.scrollBy(...a),
				externalPobotScrollTo: (...a) => this.pobot.scrollTo(...a),
				externalPobotGetScreenshot: (...a) => this.pobot.getScreenshot(...a),
			}
		}
	];

	async setUp()
	{
		const options = [`--window-size=${this.width},${this.height}`, `--url="${this.startDocument}"`].concat(
			!Boolean(Number(process.env.TEST_VISIBLE ?? 0))
			? ['--headless', '--disable-gpu']
			: []
		);

		Error.stackTraceLimit = Infinity;

		const pobot = this.pobot = await Pobot.get([...options, ...this.options]);

		const helpers = [...this._helpers, ...this.helpers];

		const addInits    = helpers.filter(h => h.inits).map(h => pobot.addInits(h.inits));
		const addBindings = helpers.filter(h => h.bindings).map(h => pobot.addBindings(h.bindings));

		const printConsole = (event, icon, color) => {

			const stars = {
				warning:  this.reporter.Format('\u2622', this.reporter.METHOD_WARN)
				, error:  this.reporter.Format('\u2BBF', this.reporter.METHOD_FAIL)
				, dir:    this.reporter.Format('\uD83D\uDF87', this.reporter.METHOD_SUCCESS)
				, log:    this.reporter.Format('\uD83D\uDF87', this.reporter.DIM)
			};

			const star = icon || stars[event.type];

			const all = Promise.all(event.args.map(a => pobot.getObject(a)));

			const frame = event.stackTrace.callFrames[0];

			const printer = (mapped) => {

				const line = String((mapped.length === 1 && typeof mapped[0] !== 'object') ? mapped[0] : mapped.map(JSON.stringify).join(', '));

				if(event.type === 'error')
				{
					this.assertSilent(false, line);
				}

				if(event.type === 'warning')
				{
					this.assertSilent(false, line, this.WARN);
				}

				let position;

				if(frame)
				{
					position = event.type === frame.functionName
						? ` ${frame.functionName} (${frame.url||'<anonymous>'}:${frame.lineNumber}:${frame.columnNumber})`
						: ` ${frame.url||'<anonymous>'}:${frame.lineNumber}:${frame.columnNumber}`;
				}

				const justify = ' '.repeat(Math.max(0, 40 - line.length));

				if(!color && ['trace', 'assert'].includes(event.type))
				{
					color = this.reporter.DIM;
				}
				else if(!color && ['error'].includes(event.type))
				{
					color = this.reporter.METHOD_FAIL;
				}
				else if(!color && ['warning'].includes(event.type))
				{
					color = this.reporter.METHOD_WARN;
				}

				this.reporter.Print(
					`    ${star||'\uD83D\uDF87'} `
						+ this.reporter.Format(line, color || this.reporter.NORMAL)
						+ (position
							? (justify + this.reporter.Format(position, this.reporter.DIMMER))
							: ''
						)
				);
			};

			const waitFor = Promise.allSettled(pendingPrintLog);

			const waiter  = all.then(args => waitFor.then(() => printer(args)));

			pendingPrintLog.add(waiter);

			waiter.finally(() => pendingPrintLog.delete(waiter));

			pendingRequests.add(all);

			all.finally(() => pendingRequests.delete(all));

			return waiter;
		};

		const printTrace = event => {

			let level = 0;

			if(event.type === 'assert')
			{
				event.stackTrace.callFrames.shift();
				level = event.args.length > 1 ? event.args.pop().value : this.ERROR;
			}
			else if(event.type === 'error')
			{
				level = 2;
			}

			const stars = [
				this.reporter.Format('\uD83D\uDF87', this.reporter.DIM)
				, '\uD83D\uDF87'
				, this.reporter.Format('\u2716', this.reporter.METHOD_FAIL)
				, this.reporter.Format('\u2622', this.reporter.METHOD_WARN)
				, this.reporter.Format('\uD83D\uDFB4', this.reporter.METHOD_NOTICE)
			];

			const colors = [
				null
				, null
				, this.reporter.METHOD_FAIL
				, this.reporter.METHOD_WARN
				, this.reporter.METHOD_NOTICE
			];

			const color = colors[level] || null;
			const star  = stars[level]  || '\uD83D\uDF87';

			const printLine = printConsole(event, star, color);

			if(event.type === 'assert' && level >= this.WARN || !event.stackTrace || !event.stackTrace.callFrames || !event.stackTrace.callFrames.length)
			{
				return;
			}

			const waitFor = Promise.allSettled(pendingPrintLog);

			const printer = () => {
				this.reporter.Print(`       at ` + event.stackTrace.callFrames.map(frame => frame.functionName
					? `${frame.functionName} (${frame.url||'<anonymous>'}:${frame.lineNumber}:${frame.columnNumber})`
					: `${frame.url||'<anonymous>'}:${frame.lineNumber}:${frame.columnNumber}`
				).join('\n       at '));
			};

			const waiter = waitFor.then(() => printLine.then(printer));

			waitFor.finally(() => pendingPrintLog.delete(waiter));

			pendingPrintLog.add(waiter);
		}

		const addHandlers = pobot.addConsoleHandler({
			warning:  printConsole
			, assert: printTrace
			, trace:  printTrace
			, error:  printTrace
			, info:   printConsole
			, dir:    printConsole
			, log:    printConsole
			, '!':    event => console.dir(event, {depth:null})
		});

		const addExceptionHandler = pobot.client.Runtime.exceptionThrown(exception => console.dir(exception, {depth:null}));

		this.setUpTime = Date.now();

		await Promise.all([addBindings, addInits, addHandlers, addExceptionHandler]);

		this.loadStartDocument = pobot.goto(this.startDocument);

		await this.loadStartDocument;
	}

	async breakDown()
	{
		if(Date.now() - this.setUpTime < 100)
		{
			await Delay(100);
		}

		return this.pobot.kill();
	}

	async wrapScript(name, script, {withCoverage = false, withScreenshot = false} = {withCoverage: false, withScreenshot: false})
	{
		const {pobot, reporter} = this;

		withCoverage = withCoverage && pobot.adapter.type === 'chrome';

		if(withCoverage)
		{
			await pobot.startCoverage();
		}

		if(!this.loadStartDocument)
		{
			this.loadStartDocument = pobot.goto(this.startDocument);
		}

		await this.loadStartDocument;

		const helpers = [...this._helpers, ...this.helpers];
		await Promise.all(helpers.filter(h => h.modules).map(h => pobot.addModules(h.modules)));

		let result = undefined;

		try
		{
			result = await pobot.inject(script);
		}
		catch(error)
		{
			this.fail[this.EXCEPTION]++;

			if(error.result)
			{
				let getStackTrace;

				if(error.result.type === 'object' && error.result.subtype === 'error')
				{
					getStackTrace = Promise.resolve(error.result.description);
				}
				else
				{
					getStackTrace = pobot.getStackTrace(error);
				}

				return getStackTrace.then(trace => reporter.exceptionCaught(trace, this));
			}
			else if(error.response)
			{
				error.response.data && reporter.exceptionCaught(error.response.data, this);
			}
			else if(error.exceptionDetails)
			{
				reporter.exceptionCaught(error.exceptionDetails.text, this);
			}
			else
			{
				reporter.exceptionCaught(error, this);
			}
		}

		if(withScreenshot)
		{
			const screenshotFile = `${process.cwd()}/screenshots/${name}.png`;
			const takeScreenshot = pobot.getScreenshot({filename: screenshotFile, captureBeyondViewport:true});

			pendingRequests.add(takeScreenshot);
			takeScreenshot.finally(() => pendingRequests.delete(takeScreenshot));
		}

		if(withCoverage)
		{
			const coverageFile = `${process.cwd()}/coverage/v8/${name}-coverage.json`;

			await pobot.stopCoverage();
			const coverage = await pobot.takeCoverage();
			await fsp.writeFile(coverageFile, JSON.stringify(coverage, null, 4));
		}

		await Promise.all(pendingRequests);

		return result;
	}

	async runTestScript(testPath, {withCoverage = false, withScreenshot = false} = {withCoverage: false, withScreenshot: false})
	{
		const realTestPath = path.resolve(testPath);
		const testScript = await import(`${realTestPath}.mjs`);
		const name = path.basename(realTestPath);
		return this.wrapScript(name, testScript[name], {withScreenshot, withCoverage});
	}

	generateTestMethod(testPath, {withCoverage = false, withScreenshot = false} = {withCoverage: false, withScreenshot: false})
	{
		const realTestPath = path.resolve(testPath);
		const expected = fs.readFileSync(`${realTestPath}.txt`, {encoding: 'utf8'});
		const name = path.basename(realTestPath);

		const docCheckMessage = (a,b) => `Output from test script "${name}" incorrect or corrupted.\n`
			+ `\x1b[32m[-] Expected:\x1b[0m `
			+ `\x1b[31m[+] Actual:\x1b[0m\n`
			+ `\x1b[32m[-] ${JSON.stringify(a)}\x1b[0m\n`
			+ `\x1b[31m[+] ${JSON.stringify(b)}\x1b[0m`;

		const func = async () => {
			const testScript = await import(`${realTestPath}.mjs`);
			return this.wrapScript(name, testScript[name], expected, {withScreenshot, withCoverage});
		};

		const method = async () => this.assertEquals(expected, await func(), docCheckMessage);

		return method.bind(this);
	}
}
