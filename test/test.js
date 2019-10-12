import { Test        } from './Test';
import { GoodTest    } from './GoodTest';
import { TestTest    } from './TestTest';
import { GreyTest    } from './GreyTest';
import { PromiseTest } from './PromiseTest';

Test.run(
	new GreyTest
	, new TestTest
	, new PromiseTest
	, new GoodTest
);

