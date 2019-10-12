import { Test        } from './Test';
import { GoodTest    } from './GoodTest';
import { TestTest    } from './TestTest';
import { GreyTest    } from './GreyTest';
import { PromiseTest } from './PromiseTest';
import { EmptyTest   } from './EmptyTest';
import { WarningTest } from './WarningTest';
import { NoticeTest  } from './NoticeTest';

Test.run(
	EmptyTest
	, GreyTest
	, GoodTest
	, NoticeTest
	, WarningTest
	, TestTest
	, PromiseTest
);
