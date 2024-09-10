import { ExceptionTest } from '../test/ExceptionTest.mjs';

export class FailingExceptionTest extends ExceptionTest
{
	testUnmetExceptionExpectation()
	{
		this.expect(Error);
	}

	testUnmetExpectedAsyncException()
	{
		this.expect(Error);

		return new Promise((accept,reject) => {
			accept();
		});
	}

	testUnmetInlineException()
	{
		this.expect(Error, (XError) => {});
	}

	testUnmetAsyncInlineException()
	{
		return new Promise((accept,reject)=>{
			this.expect(XError, (XError) => {});
			accept();
		});
	}

	testUnexpectedException()
	{
		throw new Error('TESTING ERROR TESTING ERROR TESTING ERROR');
	}
}
