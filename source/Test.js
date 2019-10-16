import { Reporter } from './Reporter';

const recurse = Symbol('recurse');

export class Test
{
	static run(...tests)
	{
		this.expected = false;

		this.reporter = new Reporter;

		this.reporter.suiteStarted();

		return this[recurse](...tests).finally(()=>{
			this.reporter.suiteComplete();
		});
	}

	static [recurse](...tests)
	{
		if(!tests.length)
		{
			return Promise.resolve();
		}

		let test = tests.shift();

		if(Test.isPrototypeOf(test))
		{
			test = new test({reporter: this.reporter});
		}

		if(test instanceof Test)
		{
			test = test.run(this.reporter);
		}

		if(!test)
		{
			test = Promise.resolve(test);
		}

		return test.finally(() => { return this[recurse](...tests) });
	}

	constructor(args = {})
	{
		this.reporter = args.reporter;

		this.total = 0;
		this.good  = 0;
		this.error = 0;
		this.fail  = [];

		['REJECTION', 'EXCEPTION', 'ERROR', 'WARN', 'NOTICE'].map((level, index)=>{

			this.fail[index] = 0;

			Object.defineProperty(this, level, {
				enumerable: false,
				writable:   false,
				value:      index
			});
		});
	}

	assert(condition, errorMessage, level = this.ERROR)
	{
		this.reporter.assertation(errorMessage, level);

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

		this.reporter.assertationFailed(errorMessage, level);
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

	setUp()
	{

	}

	breakDown()
	{

	}

	run(reporter)
	{
		const testMethods = [];
		const constructor = this.constructor;

		for(let object = Object.getPrototypeOf(this)
			;   object != null
			;   object = Object.getPrototypeOf(object)
		){
			testMethods.push(...Object.getOwnPropertyNames(object).filter((property)=>{
				return object[property] instanceof Function
					&& object[property] !== object.constructor
					&& property.match(/^test/);
			}));
		}

		reporter.testStarted(this);

		const runMethods = (...methods) => {

			if(!methods.length)
			{
				return Promise.resolve();
			}

			const method = methods.shift();
			const test   = new constructor({reporter});

			test.setUp();

			reporter.methodStarted(test, method);

			return (new Promise((accept, reject)=>{

				let result = test[method]();

				if(!(result instanceof Promise))
				{
					result = Promise.resolve(result);
				}

				result.then(accept).catch(reject);

			})).then(()=>{

				if(test.expected)
				{
					test.assert(false, `Unmet error expectation, Expected ${test.expected.name}.`);
				}

			}).catch((error)=>{
				if(error instanceof Error)
				{
					if(test.expected && error instanceof test.expected)
					{
						test.assert(true);
					}
					else
					{
						reporter.exceptionCaught(error);
						test.fail[test.EXCEPTION]++;
					}
					
				}
				else
				{
					reporter.promiseRejected(error);

					test.fail[test.REJECTION]++;
				}

			}).finally(()=>{

				test.breakDown();

				reporter.methodComplete(test, method);

				return runMethods(...methods)

			});

			test.breakDown();

			reporter.methodComplete(test, method);

			return runMethods(...methods);
		};

		return runMethods(...testMethods).finally(()=>{
			reporter.testComplete(this);
		});
	}
}
