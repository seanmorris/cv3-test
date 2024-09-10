import { Test } from '../Test.mjs';
import { FailingExceptionTest } from './FailingExceptionTest.mjs';
import { FailingPromiseTest } from './FailingPromiseTest.mjs';
import { FailingTestTest } from './FailingTestTest.mjs';

Test.run(
	FailingExceptionTest
	, FailingPromiseTest
	, FailingTestTest
);
