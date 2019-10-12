import { Test } from './Test';

export class TestTest extends Test
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

	testMultilineAssertation()
	{
		this.assert(0 === 1, `Random assertation with\nmultiple lines!`);
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
