import { Test } from '../Test.mjs';
import { FailingExceptionTest } from './FailingExceptionTest.mjs';
import { FailingPromiseTest } from './FailingPromiseTest.mjs';
import { FailingSetUpTest } from './FailingSetUpTest.mjs';
import { FailingTestTest } from './FailingTestTest.mjs';

Test.run(
	FailingExceptionTest
	, FailingPromiseTest
	, FailingSetUpTest
	, FailingTestTest
);
