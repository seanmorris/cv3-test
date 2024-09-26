import { Reporter } from './Reporter.mjs';

const recurse = Symbol('recurse');

export class Test
{
	parallel = Boolean(Number(process.env.TEST_PARALLEL ?? 1));

	static async run(...tests)
	{
		this.failureIsExpected = false;
		this.currentMethod = null;
		this.expected = false;

		this.reporter = new (this.Reporter || Reporter);

		this.reporter.suiteStarted();

		if(Boolean(Number(process.env.TEST_ALL_PARALLEL ?? 0)))
		{
			const testResults = [];
			for(const testClass of tests)
			{
				const test = new testClass({reporter: this.reporter});
				testResults.push(test.run(this.reporter))
			}

			return Promise.all(testResults).finally(() => this.reporter.suiteComplete());
		}

		return this[recurse](...tests).finally(() => this.reporter.suiteComplete());
	}

	static async [recurse](...tests)
	{
		if(!tests.length)
		{
			return Promise.resolve();
		}

		const testClass = tests.shift();
		const test = new testClass({reporter: this.reporter});

		try
		{
			await test.run(this.reporter);
		}
		finally
		{
			return this[recurse](...tests);
		}
	}

	constructor(args = {})
	{
		this.reporter = args.reporter;

		this.total = 0;
		this.good  = 0;
		this.error = 0;
		this.fail  = [];

		['REJECTION', 'EXCEPTION', 'ERROR', 'WARN', 'NOTICE'].map((level, index) => {
			Object.defineProperty(this, level, {value: index});
			this.fail[index] = 0;
		});
	}

	assert(condition, errorMessage, level = this.ERROR)
	{
		this.reporter.assertion(errorMessage, level, this);

		this.total++;

		if(condition)
		{
			this.good++;

			this.reporter.assertionPassed(errorMessage, level, this);

			return;
		}

		if(!this.fail[level])
		{
			this.fail[level] = 0;
		}

		this.fail[level]++

		this.reporter.assertionFailed(errorMessage, level, this);
	}

	annotate(message)
	{
		this.reporter.annotate(message, this);
	}

	assertSilent(condition, errorMessage, level = this.ERROR)
	{
		this.total++;

		if(condition)
		{
			this.good++;

			return;
		}

		if(!this.fail[level])
		{
			this.fail[level] = 0;
		}

		this.fail[level]++

		this.reporter.assertionFailedSilent(errorMessage, level, this);
	}

	expect(errorType, callback = null)
	{
		if(!Error.isPrototypeOf(errorType))
		{

		}

		if(callback)
		{
			try
			{
				callback();
			}
			catch(error)
			{
				if(error instanceof errorType)
				{
					this.assert(true);
					return;
				}
				else
				{
					throw error;
				}
			}

			this.assert(
				false
				, `Unmet error expectation, Expected ${errorType.name}.`
			);

			return;
		}

		this.expected = errorType;
	}

	shouldFail()
	{
		this.failureIsExpected = true;
	}

	setUp()
	{
		return Promise.resolve();
	}

	breakDown()
	{
		return Promise.resolve();
	}

	async run(reporter)
	{
		const testMethods = [];
		const constructor = this.constructor;

		for(let object = this
			; object != null
			; object = Object.getPrototypeOf(object)
		){
			testMethods.push(...Object.getOwnPropertyNames(object).filter((property) => {
				return object[property] instanceof Function
					&& object[property] !== object.constructor
					&& property.match(/^test/);
			}));
		}

		reporter.testStarted(this);

		const runMethods = async (...methods) => {
			if(!methods.length)
			{
				return Promise.resolve();
			}

			const test = new constructor({reporter});

			const method = methods.shift();
			test.currentMethod = method;

			reporter.methodStarted(test, method);
			
			await test.setUp();

			try
			{
				await test[method]();

				if(test.expected)
				{
					test.assert(false, `Unmet error expectation, Expected ${test.expected.name}.`);
				}
			}
			catch(error)
			{
				if(error instanceof Error)
				{
					if(test.expected && error instanceof test.expected)
					{
						test.assert(true);
					}
					else
					{
						reporter.exceptionCaught(error, test);
						test.fail[test.EXCEPTION]++;
					}
				}
				else
				{
					const stringError = (error && error.toString && String(error) !== '[object Object]')
						? String(error)
						: JSON.stringify(error);

					reporter.promiseRejected(stringError, test);
					test.fail[test.REJECTION]++;
				}
			}
			finally
			{
				await test.breakDown();
				reporter.methodComplete(test, method);
				test.currentMethod = null;

				return runMethods(...methods);
			}
		};

		if(this.parallel)
		{
			return Promise.all(testMethods.map(m => runMethods(m))).finally(() => reporter.testComplete(this));
		}

		return runMethods(...testMethods).finally(() => reporter.testComplete(this));
	}

	assertEquals(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(a === b, errorMessage, level);
	}

	assertSimilar(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(a == b, errorMessage, level);
	}

	assertStringsEqual(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(String(a) === String(b), errorMessage, level);
	}

	assertNumbersEqual(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(Number(a) === Number(b), errorMessage, level);
	}

	assertGreaterThan(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(a > b, errorMessage, level);
	}

	assertGreaterThanOrEquals(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(a >= b, errorMessage, level);
	}

	assertLessThan(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(a < b, errorMessage, level);
	}

	assertLessThanOrEquals(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(a <= b, errorMessage, level);
	}

	assertInstanceOf(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(a instanceof b, errorMessage, level);
	}

	assertTypeOf(a, b, errorMessage, level = this.ERROR)
	{
		if(typeof errorMessage === 'function')
		{
			errorMessage = errorMessage(a,b);
		}

		this.assert(typeof a === b, errorMessage, level);
	}
}
