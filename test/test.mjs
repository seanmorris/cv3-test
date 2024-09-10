import { Test } from '../Test.mjs';
import { GoodTest } from './GoodTest.mjs';
import { TestTest } from './TestTest.mjs';
import { GreyTest } from './GreyTest.mjs';
import { PromiseTest } from './PromiseTest.mjs';
import { EmptyTest } from './EmptyTest.mjs';
import { WarningTest } from './WarningTest.mjs';
import { NoticeTest } from './NoticeTest.mjs';
import { ExceptionTest } from './ExceptionTest.mjs';

Test.run(
	EmptyTest
	, GreyTest
	, GoodTest
	, NoticeTest
	, WarningTest
	, TestTest
	, PromiseTest
	, ExceptionTest
);
