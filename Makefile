.PHONY: build test test-fail clean reconfigure

build: source/*.js
	@ npx babel source --out-dir . \

test: source/*.js test/*.js
	@ npx babel source test --out-dir . \
	&& node test.js

test-fail: source/*.js test/*.js test-fail/*.js
	@ npx babel source test test-fail --out-dir . \
	&& node test.js

dependencies:
	@ npm install -s

update-dependencies:
	@ npm update -s

clean:
	@ rm -rf *.js
