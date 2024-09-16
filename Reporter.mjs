export class Reporter extends (class{})
{
	constructor(args)
	{
		super(args);

		this.Print  = this.Print  || console.error;

		this.Format = this.Format || ((message, type = this.NORMAL) => {

			switch(type)
			{
				case this.NORMAL:
					message = `\x1b[0m${message}\x1b[0m`;
					break;

				case this.TEST_NAME:
					message = `\x1b[22m${message}\x1b[0m`;
					break;

				case this.METHOD_NAME:
					message = `\x1b[22m${message}\x1b[0m`;
					break;

				case this.ASSERT_FAIL:
					message = `\x1b[31m${message}\x1b[0m`;
					break;

				case this.ASSERT_WARN:
					message = `\x1b[93m${message}\x1b[0m`;
					break;

				case this.ASSERT_NOTICE:
					message = `\x1b[33m${message}\x1b[0m`;
					break;

				case this.METHOD_SUCCESS:
					message = `\x1b[32m${message}\x1b[0m`;
					break;

				case this.METHOD_FAIL:
					message = `\x1b[31m${message}\x1b[0m`;
					break;

				case this.METHOD_WARN:
					message = `\x1b[93m${message}\x1b[0m`;
					break;

				case this.METHOD_NOTICE:
					message = `\x1b[33m${message}\x1b[0m`;
					break;

				case this.TEST_SUCCESS:
					message = `\x1b[32m${message}\x1b[0m`;
					break;

				case this.TEST_FAIL:
					message = `\x1b[31m${message}\x1b[0m`;
					break;

				case this.TEST_WARN:
					message = `\x1b[93m${message}\x1b[0m`;
					break;

				case this.TEST_NOTICE:
					message = `\x1b[33m${message}\x1b[0m`;
					break;

				case this.EXCEPTION:
					message = `\x1b[31m${message}\x1b[0m`;
					break;

				case this.HEADING:
					message = `${message}\x1b[0m`;
					break;

				case this.DIM:
					message = `\x1b[37m${message}\x1b[0m`;
					break;

				case this.DIMMER:
					message = `\x1b[90m${message}\x1b[0m`;
					break;
			}

			return message;
		});

		this.testData = {totals: {}, tests:{}};

		[
			'NORMAL', 'TEST_NAME', 'TEST_SUCCESS', 'TEST_FAIL', 'TEST_NOTICE', 'TEST_WARN'
			, 'METHOD_NAME', 'METHOD_SUCCESS', 'METHOD_FAIL', 'METHOD_NOTICE', 'METHOD_WARN'
			, 'ASSERT_FAIL', 'ASSERT_WARN', 'ASSERT_NOTICE', 'EXCEPTION', 'HEADING'
			, 'DIM', 'DIMMER'
		].map((level, index)=>{

			Object.defineProperty(this, level, {
				enumerable: false,
				writable:   false,
				value:      index
			});
		});
	}

	box(width, ...lines)
	{
		this.Print('#'.repeat(width));
		this.Print('#', ' '.repeat(width - 4), '#');

		lines.map((line) => {

			const padding    = (width - line.length) - 5;
			const whitespace = padding > 0 ? ' '.repeat(padding) : '';

			this.Print('#', line, whitespace, '#')
		});

		this.Print('#', ' '.repeat(width - 4), '#');
		this.Print('#'.repeat(width));
		this.Print('');
	};

	suiteStarted()
	{
		this.box(47
			, `Curvature 3 Testing Framework`
			, `© 2019-2024 Sean Morris`
			, ``
			, `seanmorris/cv3-test`
			, `https://github.com/seanmorris/cv3-test`
			, `https://www.npmjs.com/package/cv3-test`
		);

		this.Print(`------------- ☯  Starting test ☯  -------------\n`);
	}

	suiteComplete()
	{
		const tests = Object.values(this.testData.tests);

		const totalTests = tests.length;

		const unexpected = t => t.failureIsExpected ? [0,1] : [3,4];

		const goodTests = tests.map(

			t => t.good && !this.filterFails(t.fail, unexpected(t)).reduce((a,b)=>a+b,0)

		).filter(x=>x);

		const badTests = tests.map(

			t=>this.filterFails(t.fail, unexpected(t)).reduce((a,b)=>a+b,0)

		).filter(x=>x);

		let icon = badTests.length ? ' \u2716' : ' ✔';

		const message = this.Format(
			` ${icon} ${totalTests} Test${totalTests===1?'':'s'} ran.`
				+ `\n    ${goodTests.length} Passed.`
				+ `\n    ${badTests.length} Failed.`
				+ `\n`
			, badTests.length ? this.TEST_FAIL : this.TEST_SUCCESS
		);

		this.testData.totals.total = tests.length;
		this.testData.totals.good  = goodTests.length;
		this.testData.totals.bad   = badTests.length;

		this.Print(message);

		if(process !== undefined)
		{
			process.exitCode = Number(!!badTests.length);
		}

		this.Print(`----------- ☯  Testing completed ☯  -----------`);

		process.stdout.write(JSON.stringify(this.testData, null, '\t') + '\n');
	}

	testStarted(test)
	{
		const name = test.constructor.name;

		this.testData.tests[name] = this.testData.tests[name] || {total: 0, good:0, failures:0, fail:[], methods:{}};

		this.Print(this.Format(
			` ▾ Running Test: ${
				this.Format(name, this.TEST_NAME)
			}`
			, this.HEADING
		));
	}

	testComplete(test)
	{
		const name  = test.constructor.name;

		if(!this.testData.tests[name])
		{
			return;
		}

		const fail      = this.testData.tests[name].fail  || [];
		const failedAssertations = this.filterFails(fail, [test.REJECTION, test.EXCEPTION, test.NOTICE]).reduce((a,b)=>a+b,0);

		const hardFails = this.filterFails(fail, [test.NOTICE]).reduce((a,b)=>a+b,0);
		const total     = this.testData.tests[name].total || 0;
		const good      = this.testData.tests[name].good  || 0;
		const failures  = this.testData.tests[name].failures || 0;;

		const totalMethods = this.testData.tests[name].totalMethods || 0;
		const goodMethods  = this.testData.tests[name].goodMethods  || 0;
		const failureMethods = this.testData.tests[name].failureMethods  || 0;

		if(!hardFails)
		{
			let icon  = ' ✔';
			let color = this.TEST_SUCCESS;

			this.testData.tests[name].rank = 0;

			if(fail[test.NOTICE] || !goodMethods)
			{
				icon = ' \uD83D\uDFB4';
				color = this.TEST_NOTICE;

				this.testData.tests[name].rank = 1;
			}

			this.Print((!total ? '\n' : '') + this.Format(
				` ${icon} ${good}/${total} successful assertion${good===1?'':'s'} in ${name}.\n`
				+ `    ${goodMethods}/${totalMethods} successful method${goodMethods===1?'':'s'} in ${name}.\n`
				, color
			));

			this.Print(`-----------------------------------------------\n`);

			return;
		}

		let icon  = ' \u2622';
		let color = this.TEST_WARN;

		this.testData.tests[name].rank = 2;

		if(fail[test.ERROR] || fail[test.EXCEPTION] || fail[test.REJECTION])
		{
			icon  = ' \u2716';
			color = this.TEST_FAIL;

			this.testData.tests[name].rank = 3;
		}

		this.Print(this.Format(` ${icon} ${name}`
			+ `\n    ${totalMethods} method${totalMethods===1?'':'s'}, `
			+ `${goodMethods} Succeeded, ${failureMethods} Failed.`
			+ `\n    ${total} assertion${total===1?'':'s'}, `
			+ `${good} Succeeded, ${failedAssertations} Failed.`
			+ `\n    ${fail[test.ERROR]} Error${fail[test.ERROR]===1?'':'s'}`
			+ `, ${fail[test.WARN]     } Warning${fail[test.WARN]===1?'':'s'}`
			+ `, ${fail[test.NOTICE]   } Notice${fail[test.NOTICE]===1?'':'s'}`
			+ `, ${fail[test.EXCEPTION]} Exception${fail[test.EXCEPTION]===1?'':'s'}`
			+ `, ${fail[test.REJECTION]} Rejection${fail[test.REJECTION]===1?'':'s'}.`
		, color));

		this.Print(`\n-----------------------------------------------\n`);
	}

	methodStarted(test, method)
	{
		const name = test.constructor.name;

		this.testData.tests[name].methods[method] = {total: 0, good: 0, failures: 0, alerts: [], annotations: []};

		this.Print(this.Format(
			`  ▸ Method: ${this.Format(method, this.METHOD_NAME)}`, this.HEADING
		));
	}

	methodComplete(test, method)
	{
		const name = test.constructor.name;

		const failedAssertations = this.filterFails(test.fail, [
			test.REJECTION, test.EXCEPTION, test.NOTICE
		]).reduce((a,b)=>a+b,0);

		const hardFails = this.filterFails(test.fail, [test.NOTICE]).reduce((a,b)=>a+b,0);

		const failures = test.fail.reduce((a,b)=>a+b,0);

		this.testData.tests[name].totalMethods   = this.testData.tests[name].totalMethods   || 0;
		this.testData.tests[name].goodMethods    = this.testData.tests[name].goodMethods    || 0;
		this.testData.tests[name].failureMethods = this.testData.tests[name].failureMethods || 0;

		this.testData.tests[name].total     = this.testData.tests[name].total    || 0;
		this.testData.tests[name].good      = this.testData.tests[name].good     || 0;
		this.testData.tests[name].failures  = this.testData.tests[name].failures || 0;
		this.testData.tests[name].fail      = this.testData.tests[name].fail     || [];

		this.testData.tests[name].total     += test.total;
		this.testData.tests[name].good      += test.good;
		this.testData.tests[name].failures  += hardFails;

		this.testData.tests[name].totalMethods   += 1
;		this.testData.tests[name].goodMethods    += (test.good && !hardFails) ? 1:0;
		this.testData.tests[name].failureMethods += !test.good ? 1:0;

		this.testData.tests[name].methods[method].total    = test.total;
		this.testData.tests[name].methods[method].good     = test.good;
		this.testData.tests[name].methods[method].failures = hardFails;

		for(let i in test.fail)
		{
			this.testData.tests[name].fail[i] = this.testData.tests[name].fail[i] || 0;

			this.testData.tests[name].fail[i] += test.fail[i];
		}

		if(!hardFails)
		{
			let icon  = ' ✔';
			let color = this.METHOD_SUCCESS;

			if(test.fail[test.NOTICE] || !test.good)
			{
				icon = ' \uD83D\uDFB4';
				color = this.METHOD_NOTICE;
			}

			this.Print(this.Format(
				` ${icon} ${test.good}/${test.total} successful assertion${test.good===1?'':'s'} in ${method}.`
				, color
			));
			return;
		}

		let icon  = ' \u2622';
		let color = this.METHOD_WARN;

		if(test.fail[test.ERROR] || test.fail[test.EXCEPTION] || test.fail[test.REJECTION])
		{
			icon  = ' \u2716';
			color = this.METHOD_FAIL;
		}

		this.Print(`\n   ` + this.Format(`${icon} ${method}`
			+ `\n      ${test.total} assertion${test.total===1?'':'s'}, `
			+ `${test.good} Succeeded, ${failedAssertations} Failed.`
			+ `\n      ${test.fail[test.ERROR]} Error${test.fail[test.ERROR]===1?'':'s'}`
			+ `, ${test.fail[test.WARN]     } Warning${test.fail[test.WARN]===1?'':'s'}`
			+ `, ${test.fail[test.NOTICE]   } Notice${test.fail[test.NOTICE]===1?'':'s'}`
			+ `, ${test.fail[test.EXCEPTION]} Exception${test.fail[test.EXCEPTION]===1?'':'s'}`
			+ `, ${test.fail[test.REJECTION]} Rejection${test.fail[test.REJECTION]===1?'':'s'}.`
			+ `\n`
		, color));
	}

	assertion(errorMessage, level, test)
	{}

	assertionPassed(errorMessage, level, test)
	{}

	assertionFailed(errorMessage, level, test)
	{
		const trace = new Error().stack.split('\n').slice(2);

		while(trace[0] && String(trace[0]).match(/^\s+at\s.+?.assert.+\(/))
		{
			trace.shift();
		}

		trace.unshift('');

		const name = test.constructor.name;

		this.testData.tests[name].methods[test.currentMethod].alerts.push(errorMessage + trace.join('\n'));

		let icon  = ' \u2716';
		let color = this.ASSERT_FAIL;

		if(level > 2)
		{
			icon  = ' \u2622';
			color = this.ASSERT_WARN;
		}
		if(level > 3)
		{
			icon  = ' \uD83D\uDFB4';
			color = this.ASSERT_NOTICE;
		}

		this.Print(
			this.Format(`   ${icon} ${String(errorMessage).replace(/\n/g, "\n       ")}`, color)
				+ (level < test.WARN ? trace.join('\n   ') : '')
		);
	}

	annotate(message, test)
	{
		const name = test.constructor.name;

		this.testData.tests[name].methods[test.currentMethod].annotations.push(message);

		const icon = '\uD83D\uDFCA';

		if(typeof message === 'object')
		{
			message = JSON.stringify(message, null, 2);
		}

		this.Print(`    ${icon} ${String(message).replace(/\n/g, "\n      ")}`);
	}

	assertionFailedSilent(errorMessage, level, test)
	{
		const trace = new Error().stack.split('\n').slice(2);

		while(trace[0] && String(trace[0]).match(/^\s+at\s.+?.assert.+\(/))
		{
			trace.shift();
		}

		const name = test.constructor.name;

		this.testData.tests[name].methods[test.currentMethod].alerts.push(errorMessage + trace.join('\n'));
	}

	exceptionCaught(exception, test)
	{
		const message = String(exception.stack || exception);

		const name = test.constructor.name;

		this.testData.tests[name].methods[test.currentMethod].alerts.push(message);

		this.Print(this.Format(
			'  \u2716 ' + message.replace(/\n\s+/g, "\n       ").replace(/\n\b/g, "\n     ")
			, this.EXCEPTION
		));
	}

	promiseRejected(rejection, test)
	{
		let message = rejection;

		const name = test.constructor.name;

		this.testData.tests[name].methods[test.currentMethod].alerts.push(message);

		if(rejection instanceof Error)
		{
			message = rejection.message;
		}

		this.Print(this.Format(
			'  \u2716 ' + (message || '').replace(/\n/g, "\n      "), this.EXCEPTION)
		);
	}

	filterFails(fails, skip)
	{
		if(!fails)
		{
			return [0];
		}

		return fails.map((value,index)=>{

			if(skip.indexOf(index) !== -1)
			{
				return 0;
			}

			return value;
		})
	}
}
