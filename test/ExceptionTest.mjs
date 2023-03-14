import { Test } from '../Test.js';

export class ExceptionTest extends Test
{
	testExpectedException()
	{
		this.expect(Error);

		throw new Error('Expected error.');
	}

	testExpectedAsyncException()
	{
		this.expect(Error);

		return new Promise((a,r)=>{

			throw new Error('Expected async error.');

		});
	}

	testExpectedInlineException()
	{
		this.expect(Error, ()=>{
			throw new Error('Expected error.');
		});
	}

	testExpectedAsyncInlineException()
	{
		return new Promise((accept,reject)=>{

			this.expect(Error, ()=>{
				throw new Error('Expected error.');
			});

			accept();

		});
	}
}
