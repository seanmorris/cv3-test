import { Test        } from './Test';
import { GoodTest    } from './GoodTest';
import { TestTest    } from './TestTest';
import { GreyTest    } from './GreyTest';
import { PromiseTest } from './PromiseTest';
import { EmptyTest   } from './EmptyTest';

Test.run(
	GreyTest
	, GoodTest
	, EmptyTest
	, PromiseTest
	, TestTest
);
