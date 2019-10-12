import { Reporter } from './Reporter';

export class Test
{
	static run(...tests)
	{
		if(!tests.length)
		{
			return;
		}

		let step = tests.shift();

		if(step instanceof Test)
		{
			step = step.run() || Promise.resolve();
		}

		step.then(() => {

			this.run(...tests);

		});
	}

	constructor(args = {})
	{
		this.reporter = this.reporter || args.reporter || new Reporter;

		this.Name  = this.Name  || 'BaseTest';

		this.total = 0;
		this.good  = 0;
		this.error = 0;
		this.fail  = [];

		['EXCEPTION', 'ERROR', 'WARN', 'NOTICE', 'REJECTION'].map((level, index)=>{

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

	setUp()
	{

	}

	breakDown()
	{

	}

	run()
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

		this.reporter.testStarted(this);

		const runMethods = (...methods) => {

			if(!methods.length)
			{
				return Promise.resolve();
			}

			const method = methods.shift();
			const test   = new constructor;

			test.setUp();

			this.reporter.methodStarted(test, method);

			try
			{
				let result = test[method]();

				if(result instanceof Promise)
				{
					return result.catch((error)=>{

						this.reporter.promiseRejected(error);

						test.fail[test.REJECTION]++;

					}).finally(()=>{

						test.breakDown();

						this.reporter.methodComplete(test, method);

						return runMethods(...methods)

					});
				}
			}
			catch(exception)
			{
				this.reporter.exceptionCaught(exception);

				test.fail[test.EXCEPTION]++;
			}

			test.breakDown();

			this.reporter.methodComplete(test, method);

			return runMethods(...methods);
		};

		return runMethods(...testMethods).finally(()=>{
			this.reporter.testComplete(this);
		});
	}
}
