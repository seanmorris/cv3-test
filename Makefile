.PHONY: build test clean reconfigure

build: source/*.js
	@ npx babel source --out-dir . \

test: source/*.js  test/*.js
	@ npx babel source test --out-dir . \
	&& node test.js

dependencies:
	@ npm install -s

update-dependencies:
	@ npm update -s

clean:
	@ rm -rf node_modules *.js
