import { Test } from '../Test.mjs';

export class GreyTest extends Test
{
	testWarning()
	{
		this.assert(0 === 1, '0 is not equal to 1!', this.WARN);
	}

	testNotice()
	{
		this.assert(0 === 1, '0 is not equal to 1!', this.NOTICE);
	}
}
