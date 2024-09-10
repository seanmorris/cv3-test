import { Test } from '../Test.mjs';

export class GoodTest extends Test
{
	testOneSuccess()
	{
		this.assert(0 === 0, '0 is not equal to 0!');
	}

	testTenSuccesses()
	{
		for(let i = 0; i < 10; i++)
		{
			this.assert(i === i, `${i} is not equal to ${i}!`);
		}
	}
}
