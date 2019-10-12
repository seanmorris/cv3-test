export class Reporter
{
	constructor(args = {})
	{
		this.Print  = args.Print  || console.error;
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
					message = `\x1b[33m${message}\x1b[0m`;
					break;

				case this.ASSERT_NOTICE:
					message = `\x1b[0m${message}\x1b[0m`;
					break;

				case this.METHOD_SUCCESS:
					message = `\x1b[32m${message}\x1b[0m`;
					break;

				case this.METHOD_FAIL:
					message = `\x1b[31m${message}\x1b[0m`;
					break;

				case this.METHOD_WARN:
					message = `\x1b[33m${message}\x1b[0m`;
					break;

				case this.METHOD_NOTICE:
					message = `\x1b[0m${message}\x1b[0m`;
					break;

				case this.TEST_SUCCESS:
					message = `\x1b[32m${message}\x1b[0m`;
					break;

				case this.TEST_FAIL:
					message = `\x1b[31m${message}\x1b[0m`;
					break;

				case this.TEST_WARN:
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
			'NORMAL', 'TEST_NAME', 'TEST_SUCCESS', 'TEST_FAIL', 'TEST_WARN'
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
			, `Curvature 3 Testing Framework`
			, `© 2019 Sean Morris`
			, ``
			, `seanmorris/${packageInfo.name}:${packageInfo.version}`
			, `https://www.npmjs.com/package/cv3-test`
			, `https://github.com/seanmorris/cv3-test`
		);

		this.Print(`------------- ☯  Starting test ☯  -------------\n`);
	}

	suiteComplete()
	{
		const tests = Object.values(this.testData.tests);

		const totalTests = tests.length;

		const goodTests = tests.map(
			t => !this.filterFails(t.fail,[4])
					.reduce((a,b)=>a+b)
		).filter(x=>x).length;

		const badTests = tests.map(
			t=>this.filterFails(t.fail,[4])
				.reduce((a,b)=>a+b)
		).filter(x=>x).length;

		this.Print(`-----------------------------------------------\n`);

		let icon = badTests ? '💀' : ' ✓';

		// + `\n   ${totalAssert} assertation${totalAssert===1?'':'s'}`
		// + `\n     ${goodAssert} Succeeded` 
		// + `, ${failedAssert} Failed`

		const message = this.Format(
			` ${icon} ${totalTests} Test${totalTests===1?'':'s'} ran.`
				+ `\n    ${goodTests} Passed.` 
				+ `\n    ${badTests} Failed.`
				+ `\n`
			, badTests ? this.TEST_FAIL : this.TEST_SUCCESS
		);

		this.Print(message);

		if(process !== undefined)
		{
			process.exitCode = !!badTests;
		}

		this.Print(`----------- ☯  Testing completed ☯  -----------`);
	}

	testStarted(test)
	{
		const name = test.constructor.name;

		this.testData.tests[name] = this.testData.tests[name] || {total: 0};

		this.Print(this.Format(
			`▼  Running Test: ${
				this.Format(name, this.TEST_NAME)
			}\n`
			, this.HEADING
		));
	}

	testComplete(test)
	{
		const name  = test.constructor.name;

		const total    = this.testData.tests[name].total    || 0;
		const good     = this.testData.tests[name].good     || 0;
		const failures = this.testData.tests[name].failures || 0;
		const fail     = this.testData.tests[name].fail     || [];

		const failedAssertations = this.filterFails(fail, [
			test.REJECTION, test.EXCEPTION, test.NOTICE
		]).reduce((a,b)=>a+b,0);

		const hardFails = this.filterFails(fail, [test.NOTICE]).reduce((a,b)=>a+b,0);

		if(!hardFails)
		{
			let icon  = ' ✓';
			let color = this.TEST_SUCCESS;

			if(fail[test.NOTICE])
			{
				icon  = ' -';
				color = this.TEST_WARN;
			}

			this.Print(
				this.Format(
					`  ${icon} ${good} successful assertation${good===1?'':'s'} in ${name}.\n`
					, color
				)
			);
			return;
		}

		let icon  = '☢ ';
		let color = this.TEST_WARN;

		if(fail[test.ERROR] || fail[test.EXCEPTION] || fail[test.REJECTION])
		{
			icon  = '💀';
			color = this.TEST_FAIL;
		}

		this.Print(this.Format(`  ${icon} ${total} assertation${total===1?'':'s'} in ${name}.`
			+ `\n     ${good} Succeeded` 
			+ `, ${failedAssertations} Failed: `
			+ `\n     ${fail[test.ERROR]} Error${fail[test.ERROR]===1?'':'s'}`
			+ `, ${fail[test.WARN]     } Warning${fail[test.WARN]===1?'':'s'}`
			+ `, ${fail[test.NOTICE]   } Notice${fail[test.NOTICE]===1?'':'s'}`
			+ `, ${fail[test.EXCEPTION]} Exception${fail[test.EXCEPTION]===1?'':'s'}`
			+ `, ${fail[test.REJECTION]} Rejection${fail[test.REJECTION]===1?'':'s'}.`
			+ `\n`
		, color));
	}

	methodStarted(test, method)
	{
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

		this.testData.tests[name].total     = this.testData.tests[name].total     || 0;
		this.testData.tests[name].good      = this.testData.tests[name].good      || 0;
		this.testData.tests[name].failures  = hardFails  || 0;
		this.testData.tests[name].fail      = this.testData.tests[name].fail      || [];

		this.testData.tests[name].total     += test.total;
		this.testData.tests[name].good      += test.good;
		this.testData.tests[name].failures  += hardFails;

		for(let i in test.fail)
		{
			this.testData.tests[name].fail[i] = this.testData.tests[name].fail[i] || 0;

			this.testData.tests[name].fail[i] += test.fail[i];
		}

		if(!hardFails && !test.fail[test.EXCEPTION])
		{
			this.Print(
				this.Format(
					`\n     ✓  ${test.good} successful assertation${test.good===1?'':'s'} in ${method}.\n`
					, failures ? this.METHOD_NOTICE : this.METHOD_SUCCESS
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

		this.Print(this.Format(`\n     ${icon} ${test.total} assertation${test.total===1?'':'s'} in ${method}.`
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

	assertation(errorMessage, level)
	{
		
	}

	assertationFailed(errorMessage, level)
	{
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
			this.Format(`     ${icon} ${errorMessage}`, color)
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

	promiseRejected(rejectionMessage)
	{
		this.Print("     " + this.Format('💀 '
			+ rejectionMessage.replace(/\n/g, "\n        ")
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
