import { Test } from '../Test.mjs';

export class FailingSetUpTest extends Test
{
	setUp()
	{
		throw new Error('Failing setUp for regression coverage.');
	}

	testSetupFailure()
	{
		this.assert(true, 'This assertion should never run.');
	}
}
