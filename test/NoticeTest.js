import { Test } from './Test';

export class NoticeTest extends Test
{
	testNotice()
	{
		this.assert(0 === 1, '0 is not equal to 1!', this.NOTICE);
	}
}
