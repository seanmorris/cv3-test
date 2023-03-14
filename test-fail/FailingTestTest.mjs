import { TestTest } from '../test-cjs/TestTest.js';

export class FailingTestTest extends TestTest
{
	testSuccess()
	{
		this.assert(0 === 0, '0 is not equal to 0!');
	}

	testFailure()
	{
		this.assert(0 === 1, '0 is not equal to 1!');
	}

	testWarning()
	{
		this.assert(0 === 1, '0 is not equal to 1!', this.WARN);
	}

	testNotice()
	{
		this.assert(0 === 1, '0 is not equal to 1!', this.NOTICE);
	}

	testMultilineAssertion()
	{
		this.assert(0 === 1, `Random assertion with\nmultiple lines!`);
	}

	testException()
	{
		throw new Error('Random exception!');
	}

	testMultilineException()
	{
		throw new Error(`Random exception with\nmultiple lines!`);
	}

	testEmpty()
	{
		
	}
}
