import { Test } from './Test';

export class ExceptionTest extends Test
{
	testExpectedException()
	{
		this.expect(Error);

		throw new Error('Expected error.');
	}

	testUnmetExceptionExpectation()
	{
		this.expect(Error);
	}

	testExpectedAsyncException()
	{
		this.expect(Error);

		return new Promise((a,r)=>{

			throw new Error('Expected async error.');

		});

	}

	testUnmetExpectedAsyncException()
	{
		this.expect(Error);

		return new Promise((accept,reject)=>{

			accept();

		});

	}

	testExpectedInlineException()
	{
		this.expect(Error, ()=>{
			throw new Error('Expected error.');
		});
	}

	testUmetInlineException()
	{
		// const XError = class extends Error{};
		// const YError = class extends Error{};

		this.expect(Error, (XError)=>{
			// throw new YError('Unexpected error.');
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

	testUnmetAsyncInlineException()
	{
		const XError = class extends Error{};
		const YError = class extends Error{};

		return new Promise((accept,reject)=>{

			// this.expect(XError, (XError)=>{
			// 	throw new YError('Unexpected error.');
			// });

			accept();

		});
	}

	testUnexpectedException()
	{
		throw new Error('TESTING ERROR TESTING ERROR TESTING ERROR');
	}
}
