import { Test } from '../Test.mjs';

export class TestTest extends Test
{
	testSuccess()
	{
		this.assert(0 === 0, '0 is not equal to 0!');
	}

	testWarningOnly()
	{
		this.assert(0 === 1, '0 is not equal to 1!', this.WARN);
	}

	testWarningAndSuccess()
	{
		this.assert(1 === 1, '1 is not equal to 1!', this.WARN);
		this.assert(0 === 1, '0 is not equal to 1!', this.WARN);
	}

	testNoticeOnly()
	{
		this.assert(0 === 1, '0 is not equal to 1!', this.NOTICE);
	}

	testNoticeAndSuccess()
	{
		this.assert(1 === 1, '1 is not equal to 1!', this.NOTICE);
		this.assert(0 === 1, '0 is not equal to 1!', this.NOTICE);
	}

	testMultilineAssertation()
	{
		this.assert(0 === 1, `Random assertion with\nmultiple lines!`, this.NOTICE);
	}

	testEmpty()
	{
	}
}
