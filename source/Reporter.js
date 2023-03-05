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
					message = `\x1b[7m${message}\x1b[0m`;
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
					message = `\x1b[38;5:227m${message}\x1b[0m`;
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
					message = `\x1b[38;5:227m${message}\x1b[0m`;
					break;

				case this.METHOD_NOTICE:
					message = `\x1b[33m${message}\x1b[0m`;
					break;

				case this.TEST_SUCCESS:
					message = `\x1b[32m${message}\x1b[0m`;
					break;

				case this.TEST_FAIL:
					message = `\x1b[38:2:255:0:0m${message}\x1b[0m`;
					break;

				case this.TEST_WARN:
					message = `\x1b[33m${message}\x1b[0m`;
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
			}

			return message;
		});

		this.testData = {total:0, tests:{}, totals: {}};

		[
			'NORMAL', 'TEST_NAME', 'TEST_SUCCESS', 'TEST_FAIL', 'TEST_NOTICE', 'TEST_WARN'
			, 'METHOD_NAME', 'METHOD_SUCCESS', 'METHOD_FAIL', 'METHOD_NOTICE', 'METHOD_WARN'
			, 'ASSERT_FAIL', 'ASSERT_WARN', 'ASSERT_NOTICE', 'EXCEPTION', 'HEADING'
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
		this.Print('');
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
		const packageInfo = require('./package.json');

		this.box(47
			, `Curvature 3 Testing Framework ${packageInfo.version}`
			, `© 2019-2023 Sean Morris`
			, ``
			, `https://www.npmjs.com/package/cv3-test`
			, `https://github.com/seanmorris/cv3-test`
			, `seanmorris/${packageInfo.name}:${packageInfo.version}`
		);

		this.Print(`------------- ☯  Starting test ☯  -------------\n`);
	}

	suiteComplete()
	{
		const tests = Object.values(this.testData.tests);

		const totalTests = tests.length;

		const unexpected = t => t.failureIsExpected ? [0,1] : [3,4];

		const goodTests = tests.map(

			t => !this.filterFails(t.fail, unexpected(t)).reduce((a,b)=>a+b,0)

		).filter(x=>x);

		const badTests = tests.map(

			t=>this.filterFails(t.fail, unexpected(t)).reduce((a,b)=>a+b,0)

		).filter(x=>x);

		let icon = badTests.length ? '💀' : ' ✓';

		const message = this.Format(
			` ${icon} ${totalTests} Test${totalTests===1?'':'s'} ran.`
				+ `\n    ${goodTests.length} Passed.`
				+ `\n    ${badTests.length} Failed.`
				+ `\n`
			, badTests ? this.TEST_FAIL : this.TEST_SUCCESS
		);

		this.Print(message);

		if(process !== undefined)
		{
			process.exitCode = !!badTests.length;
		}

		this.Print(`----------- ☯  Testing completed ☯  -----------`);

		process.stdout.write(JSON.stringify(this.testData.tests));
	}

	testStarted(test)
	{
		const name = test.constructor.name;

		this.testData.tests[name] = this.testData.tests[name] || {total: 0, good:0, failures:0, fail:[], methods:{}};

		this.Print(this.Format(
			` ▼ Running Test: ${
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

		const failedAssertations = this.filterFails(fail, [test.REJECTION, test.EXCEPTION, test.NOTICE]).reduce((a,b)=>a+b,0);

		const hardFails = this.filterFails(fail, [test.NOTICE]).reduce((a,b)=>a+b,0);

		const total    = this.testData.tests[name].total    || 0;
		const good     = this.testData.tests[name].good     || 0;
		const failures = hardFails;
		const fail     = this.testData.tests[name].fail     || [];

		if(!hardFails)
		{
			let icon  = ' ✓';
			let color = this.TEST_SUCCESS;

			if(fail[test.NOTICE] || !good)
			{
				icon  = ' -';
				color = this.TEST_NOTICE;
			}

			this.Print(
				this.Format(
					`\n ${icon}  ${good}/${total} successful assertion${good===1?'':'s'} in ${name}.\n`
					, color
				)
			);

			this.Print(`-----------------------------------------------\n`);

			return;
		}

		let icon  = '☢ ';
		let color = this.TEST_WARN;

		if(hardFails)
		{
			icon  = '💀';
			color = this.TEST_FAIL;
		}

		this.Print(this.Format(`  ${icon} ${total} assertion${total===1?'':'s'} in ${name}.`
			+ `\n     ${good} Succeeded`
			+ `, ${failedAssertations} Failed: `
			+ `\n     ${fail[test.ERROR]} Error${fail[test.ERROR]===1?'':'s'}`
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

		this.testData.tests[name].methods[method] = {total: 0, good: 0, failures: 0, messages: []};

		this.Print(this.Format(
			`  ▶  Method: ${
				this.Format(method, this.METHOD_NAME)
			}`
			, this.HEADING
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

		this.testData.total += test.total;

		this.testData.tests[name].total     = this.testData.tests[name].total    || 0;
		this.testData.tests[name].good      = this.testData.tests[name].good     || 0;
		this.testData.tests[name].failures  = this.testData.tests[name].failures || 0;
		this.testData.tests[name].fail      = this.testData.tests[name].fail     || [];

		this.testData.tests[name].total     += test.total;
		this.testData.tests[name].good      += test.good;
		this.testData.tests[name].failures  += hardFails;

		this.testData.tests[name].methods[method].total    = test.total;
		this.testData.tests[name].methods[method].good     = test.good;
		this.testData.tests[name].methods[method].failures = hardFails;

		for(let i in test.fail)
		{
			this.testData.tests[name].fail[i] = this.testData.tests[name].fail[i] || 0;

			this.testData.tests[name].fail[i] += test.fail[i];
		}

		if(!hardFails && !test.fail[test.EXCEPTION])
		{
			let icon  = ' ✓';
			let color = this.METHOD_SUCCESS;

			if(test.fail[test.NOTICE])
			{
				icon = ' -';
				color = this.METHOD_NOTICE;
			}

			this.Print(
				this.Format(
					` ${icon}  ${test.good}/${test.total} successful assertion${test.good===1?'':'s'} in ${method}.`
					, color
				)
			);
			return;
		}

		let icon  = '☢ ';
		let color = this.METHOD_WARN;

		if(test.fail[test.ERROR] || test.fail[test.EXCEPTION] || test.fail[test.REJECTION])
		{
			icon  = '💀';
			color = this.METHOD_FAIL;
		}

		if(test.fail[test.ERROR] || test.fail[test.EXCEPTION] || test.fail[test.REJECTION])
		{
			icon  = '💀';
			color = this.METHOD_FAIL;
		}

		this.Print(this.Format(`\n     ${icon} ${test.total} assertion${test.total===1?'':'s'} in ${method}.`
			+ `\n        ${test.good} Succeeded`
			+ `, ${failedAssertations} Failed: `
			+ `\n        ${test.fail[test.ERROR]} Error${test.fail[test.ERROR]===1?'':'s'}`
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
		const name = test.constructor.name;

		this.testData.tests[name].methods[test.currentMethod].messages.push(errorMessage);

		let icon   = '💀';
		let color = this.ASSERT_FAIL;

		if(level > 2)
		{
			icon = '☢ ';
			color = this.ASSERT_WARN;
		}
		if(level > 3)
		{
			icon = '- ';
			color = this.ASSERT_NOTICE;
		}

		this.Print(
			this.Format(`     ${icon} ${String(errorMessage).replace(/\n/g, "\n        ")}`, color)
		);
	}

	exceptionCaught(exception)
	{
		this.Print(
			"     " + this.Format(
				'💀 ' + exception.stack.toString()
					.replace(/\n\s+/g, "\n          ")
					.replace(/\n\b/g, "\n        ")
				, this.EXCEPTION
			)
		);
	}

	promiseRejected(rejection)
	{
		let message = rejection;

		if(rejection instanceof Error)
		{
			message = rejection.message;
		}

		this.Print("     " + this.Format('💀 '
			+ (message || '').replace(/\n/g, "\n        ")
			, this.EXCEPTION)
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
