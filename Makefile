.PHONY: build test test-fail clean reconfigure

build:
	@ npx babel source --out-dir . \

test:
	@ npx babel test/*Test.mjs --out-dir test-cjs \

test-fail:
	@ npx babel test-fail/*Test.mjs --out-dir test-cjs-fail \

dependencies:
	@ npm install -s

update-dependencies:
	@ npm update -s

clean:
	@ rm -rf *.js test-cjs test-cjs-fail
