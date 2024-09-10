import { Test } from '../Test.mjs';

export class PromiseTest extends Test
{
	testGoodPromise()
	{
		return new Promise((accept, reject)=>{
			this.assert(0 === 0, '0 is not equal to 0!');

			setTimeout(() => {
				this.assert(0 === 0, '0 is not equal to 0!');
				this.assert(0 === 0, '0 is not equal to 0!');
				accept('Accepted!');
			}, 150);
		});
	}
}
