export class Reporter
{
	constructor(args = {})
	{
		this.Print  = args.Print  || console.log;
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

				case this.METHOD_SUCCESS:
					message = `\x1b[32m${message}\x1b[0m`;
					break;

				case this.METHOD_FAIL:
					message = `\x1b[31m${message}\x1b[0m`;
					break;

				case this.METHOD_WARN:
					message = `\x1b[33m${message}\x1b[0m`;
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

		this.testData      = {total:0, tests:{}, totals: {}};

		this.ansiColor     = true;

		[
			'NORMAL', 'TEST_NAME', 'TEST_SUCCESS', 'TEST_FAIL', 'TEST_WARN'
			, 'METHOD_NAME', 'METHOD_SUCCESS', 'METHOD_FAIL', 'METHOD_WARN'
			, 'ASSERT_FAIL', 'ASSERT_WARN', 'EXCEPTION', 'HEADING'
		].map((level, index)=>{

			Object.defineProperty(this, level, {
				enumerable: false,
				writable:   false,
				value:      index
			});
		});
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

		const total    = this.testData.tests[name].total;
		const good     = this.testData.tests[name].good;
		const failures = this.testData.tests[name].failures;
		const fail     = this.testData.tests[name].fail;

		if(!failures)
		{
			this.Print(
				this.Format(
					`  ✓ ${total} successful assertation${total===1?'':'s'} in ${name}.\n`
					, this.TEST_SUCCESS
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
			+ `, ${failures} Failed: `
			+ `\n     ${fail[test.ERROR]} Error${fail[test.ERROR]===1?'':'s'}`
			+ `, ${fail[test.EXCEPTION]} Exception${fail[test.EXCEPTION]===1?'':'s'}`
			+ `, ${fail[test.REJECTION]} Rejection${fail[test.REJECTION]===1?'':'s'}`
			+ `, ${fail[test.WARN]     } Warning${fail[test.WARN]===1?'':'s'}`
			+ `, ${fail[test.NOTICE]   } Notice${fail[test.NOTICE]===1?'':'s'}`
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
		const name     = test.constructor.name;
		const failures = test.fail.slice(2).reduce((a,b)=>a+b);

		this.testData.total += test.total;

		this.testData.tests[name].total     = this.testData.tests[name].total     || 0;
		this.testData.tests[name].good      = this.testData.tests[name].good      || 0;
		this.testData.tests[name].failures  = this.testData.tests[name].failures  || 0;
		this.testData.tests[name].fail      = this.testData.tests[name].fail      || [];

		this.testData.tests[name].total     += test.total;
		this.testData.tests[name].good      += test.good;
		this.testData.tests[name].failures  += failures;

		for(let i in test.fail)
		{
			this.testData.tests[name].fail[i] = this.testData.tests[name].fail[i] || 0;

			this.testData.tests[name].fail[i] += test.fail[i];
		}

		if(!failures && !test.fail[test.EXCEPTION])
		{
			this.Print(
				this.Format(
					`\n     ✓ ${test.total} successful assertation${test.total===1?'':'s'} in ${method}.\n`
					, this.METHOD_SUCCESS
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

		this.Print(this.Format(`\n     ${icon} ${test.total} assertation${test.total===1?'':'s'} in ${method}.`
			+ `\n        ${test.good} Succeeded` 
			+ `, ${failures} Failed: `
			+ `\n        ${test.fail[test.ERROR]} Error${test.fail[test.ERROR]===1?'':'s'}`
			+ `, ${test.fail[test.EXCEPTION]} Exception${test.fail[test.EXCEPTION]===1?'':'s'}`
			+ `, ${test.fail[test.REJECTION]} Rejection${test.fail[test.REJECTION]===1?'':'s'}`
			+ `, ${test.fail[test.WARN]     } Warning${test.fail[test.WARN]===1?'':'s'}`
			+ `, ${test.fail[test.NOTICE]   } Notice${test.fail[test.NOTICE]===1?'':'s'}`
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

		this.Print(
			this.Format(`     ${icon} ${errorMessage}`, color)
		);
	}

	exceptionCaught(exception)
	{
		this.Print(
			"     " + this.Format(
				'💀 ' + exception.stack.toString()
					.replace(/\n\s+/g, "\n        ")
				, this.EXCEPTION
			)
		);
	}

	promiseRejected(rejectionMessage)
	{
		this.Print("     " + this.Format('💀 ' + rejectionMessage, this.EXCEPTION));
	}
}
