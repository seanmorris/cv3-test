# cv3-test

Simple testing for ES6.

![screenshot](https://raw.githubusercontent.com/seanmorris/cv3-test/master/screenshot.png)

## Install

```bash
$ npm install cv3-test
```

## Usage

Simply extend the `cv3-test/Test` class. Name your test methods with the prefix `test`.


```javascript

import { Test } from 'cv3-test/Test';

export class ExampleTest extends Test
{
    testOneSuccess()
    {
        this.assert(0 === 0, '0 is not equal to 0!');
    }
}
```

## Running Tests

Use the static `run` function on the `Test` class to execute your tests. Just pass the test classes you want to run as parameters.

```javascript
import { Test } from 'cv3-test/Test';

import { FooTest } from './FooTest';
import { BarTest } from './BarTest';
import { BazTest } from './BazTest';

Test.run(FooTest, BarTest, BazTest);
```

## Promise-based tests

Test methods can return promises, to allow for testing of async behavior. Assertations can appear inside and outside the promises, and the framework will wait for the promise to complete before moving on.


```javascript
import { Test } from 'cv3-test/Test';

export class PromiseTest extends Test
{
    testPromise()
    {
        return new Promise((accept, reject)=>{

            this.assert(0 === 0, '0 is not equal to 0!');

            setTimeout(()=>{

                this.assert(0 === 0, '0 is not equal to 0!');

                accept('Accepted!');
            }, 150);

        });
    }
}
```

## License 

cv3-inject &copy; Sean Morris 2019

All code in this package is relased under the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) licence.
