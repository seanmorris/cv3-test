import { Test } from './Test';

export class PromiseTest extends Test
{
	testGoodPromise()
	{
		return new Promise((accept, reject)=>{

			this.assert(0 === 0, '0 is not equal to 0!');

			setTimeout(()=>{

				this.assert(0 === 0, '0 is not equal to 0!');

				this.assert(0 === 0, '0 is not equal to 0!');

				accept('Accepted!');
			}, 1500);

		});
	}


	testBadPromise()
	{
		return new Promise((accept, reject)=>{

			this.assert(0 === 1, '0 is not equal to 1!');

			setTimeout(()=>{

				this.assert(0 === 1, '0 is not equal to 1!');

				this.assert(0 === 1, '0 is not equal to 1!');

				reject('Rejection message here!');
			}, 1500);

		});
	}
}
