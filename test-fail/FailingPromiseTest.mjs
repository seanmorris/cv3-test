import { PromiseTest } from '../test-cjs/PromiseTest.js';

export class FailingPromiseTest extends PromiseTest
{
	testGoodPromise()
	{
		return new Promise((accept, reject)=>{

			this.assert(0 === 0, '0 is not equal to 0!');

			setTimeout(()=>{

				this.assert(0 === 0, '0 is not equal to 0!');

				this.assert(0 === 0, '0 is not equal to 0!');

				accept('Accepted!');
			}, 150);

		});
	}

	testBadPromise()
	{
		this.shouldFail();

		return new Promise((accept, reject)=>{

			this.assert(0 === 1, '0 is not equal to 1!');

			setTimeout(()=>{

				this.assert(0 === 1, '0 is not equal to 1!');

				this.assert(0 === 1, '0 is not equal to 1!');

				reject('Rejection message here!');
			}, 150);

		});
	}

	testBadEmptyPromise()
	{
		return new Promise((accept, reject)=>{

			this.assert(0 === 1, '0 is not equal to 1!');

			setTimeout(()=>{

				this.assert(0 === 1, '0 is not equal to 1!');

				this.assert(0 === 1, '0 is not equal to 1!');

				reject();
			}, 150);

		});
	}

	testAnotherBadPromise()
	{
		return new Promise((accept, reject)=>{

			this.assert(0 === 1, '0 is not equal to 1!');

			setTimeout(()=>{

				this.assert(0 === 1, '0 is not equal to 1!');

				this.assert(0 === 1, '0 is not equal to 1!');

				reject(`#######################\nMultiline Rejection\nmessage here!\n#######################`);
			}, 150);

		});
	}
}
