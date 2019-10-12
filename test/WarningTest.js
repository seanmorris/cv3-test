import { Test } from './Test';

export class WarningTest extends Test
{
	testWarning()
	{
		this.assert(0 === 1, '0 is not equal to 1!', this.WARN);
	}
}
