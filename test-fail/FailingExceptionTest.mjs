import { ExceptionTest } from '../test-cjs/ExceptionTest.js';

export class FailingExceptionTest extends ExceptionTest
{
	testUnmetExceptionExpectation()
	{
		this.expect(Error);
	}

	testUnmetExpectedAsyncException()
	{
		this.expect(Error);

		return new Promise((accept,reject)=>{

			accept();

		});

	}

	testUnmetInlineException()
	{
		// const XError = class extends Error{};
		// const YError = class extends Error{};

		this.expect(Error, (XError)=>{
			// throw new YError('Unexpected error.');
		});
	}

	testUnmetAsyncInlineException()
	{
		const XError = class extends Error{};
		const YError = class extends Error{};

		return new Promise((accept,reject)=>{

			this.expect(XError, (XError)=>{
			// 	throw new YError('Unexpected error.');
			});

			accept();

		});
	}

	testUnexpectedException()
	{
		throw new Error('TESTING ERROR TESTING ERROR TESTING ERROR');
	}
}
