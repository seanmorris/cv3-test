import { Test } from '../Test.js';

export class NoticeTest extends Test
{
	testOneSuccess()
	{
		this.assert(0 === 0, '0 is not equal to 0!');
	}

	testNotice()
	{
		this.assert(0 === 0, '0 is not equal to 0!');
		this.assert(0 === 0, '0 is not equal to 0!');
		this.assert(0 === 0, '0 is not equal to 0!');
		this.assert(0 === 0, '0 is not equal to 0!');

		this.assert(0 === 1, '0 is not equal to 1!', this.NOTICE);
	}
}
