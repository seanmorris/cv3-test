![avatar](https://avatars3.githubusercontent.com/u/640101?s=80&v=4)

# cv3-test

Simple testing for ES6.

[![cv3-test](https://img.shields.io/badge/cv3-test-darkred?style=for-the-badge)](https://github.com/seanmorris/cv3-test) [![Version Badge](https://img.shields.io/npm/v/cv3-test?label=ver&style=for-the-badge)](https://www.npmjs.com/package/cv3-test) [![Downloads Badge](https://img.shields.io/npm/dm/cv3-test?color=338800&style=for-the-badge)](https://www.npmjs.com/package/cv3-test) [![github](https://img.shields.io/badge/github-cv3--test-informational?style=for-the-badge)](https://github.com/seanmorris/cv3-test) [![github](https://img.shields.io/badge/npm-cv3--test-informational?style=for-the-badge&color=darkgreen)](https://www.npmjs.com/package/cv3-test) [![Size badge](https://img.shields.io/github/languages/code-size/seanmorris/cv3-test?style=for-the-badge)](https://www.npmjs.com/package/cv3-test) [![Apache-2.0 Licence Badge](https://img.shields.io/npm/l/cv3-test?color=338800&style=for-the-badge)](https://raw.githubusercontent.com/seanmorris/cv3-test/master/LICENSE)

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

### CLI

Install the package globally to use the `cvtest` command:

```bash
$ npm install -g cv3-test
```

Run the `cvtest` command in any directory to automatically scan for files ending in `...Test.js` (case sensitive). Any files found will be included and the system will look for tests in the class with same name as the file it resides in (minus the `.js` extension).

```bash
$ cvtest
```

### Javascript

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

cv3-test &copy; Sean Morris 2019 - 2020

All code in this package is relased under the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) licence.
