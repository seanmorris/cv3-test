.PHONY: test test-fail clean

test:
	@ node test/test.mjs > test/results.json

test-fail:
	@ node test-fail/test.mjs > test-fail/results.json

dependencies:
	@ npm install -s

update-dependencies:
	@ npm update -s

