#!/usr/bin/env make

#
#
# Default target
#
#
.PHONY: dev
dev: clear test lint ok

.PHONY: full
full: dev

.PHONY: pull-request
pull-request: dev

#
#
# Generic configuration
#
#

# https://ftp.gnu.org/old-gnu/Manuals/make-3.79.1/html_chapter/make_7.html
# https://stackoverflow.com/a/26936855/1954789
SHELL := /bin/bash
.SECONDEXPANSION:

PATH := $(shell npm root)/.bin:$(PATH)

#
#
# System variables
#
#
ROOT   ?= $(shell dirname $(abspath $(lastword $(MAKEFILE_LIST))))

.PHONY: ok
ok:
	@echo "done"

.PHONY: clear
clear:
	clear

.PHONY: dump
dump:
	$(info ROOT:          $(ROOT))
	$(info PATH:          $(PATH))
	$(info id:            $(shell id))
	$(info pwd:           $(shell pwd))
	$(info in_docker:     $(shell [ -f /.dockerenv ] && echo "in" || echo "native"))
	$(info node:          $(shell node --version) ($(shell type node)))
	$(info npm:           $(shell npm --version) ($(shell type npm)))
	$(info exiftool:      $(shell exiftool -ver) ($(shell type exiftool)))
	$(info exiftran:      ($(shell type exiftran)))
	$(info TZ:            $(TZ))
	$(info /etc/timezone  $(shell cat /etc/timezone))
# We need to run them for them to fail...
	node --version
	npm --version
	exiftool -ver
	type exiftran

#
#
# Generic functions
#
#

# See https://coderwall.com/p/cezf6g/define-your-own-function-in-a-makefile
# 1: folder where to look
# 2: base file to have files newer than, to limit the length of the output
define recursive-dependencies
	$(shell \
		if [ -r "$(2)" ]; then \
			find "$(1)" -name tests_data -prune -o -name tmp -prune -o -newer "$(2)"; \
		else \
			echo "$(1)";\
		fi \
	)
endef

# See https://git-scm.com/docs/git-ls-files
# 1: folder
define git-files
	$(shell git ls-files --cached --modified --others --full-name "$(ROOT)/$(1)" )
endef

######################
#
# Runtime
#
######################

.PHONY: clean
clean: clean-docker
	rm -fr node_modules
	rm -fr tmp

.PHONY: clean-docker
clean-docker:
	docker image rm -f jh-file-organizer

.PHONY: build
# For docker:
build: tmp/.dockerbuild
# For the rest...
build: dependencies

tmp/.dockerbuild: dependencies \
	$(shell find src -type d)

	make clean-docker
	docker build --tag jh-file-organizer .
	docker builder prune --filter until=48h --force
	mkdir -p "$(dir $@)"
	touch "$@"

.PHONY: dependencies
dependencies: node_modules/.dependencies
node_modules/.dependencies: package.json package-lock.json
	npm install
	touch package-lock.json
	@#Also done in package.json
	touch node_modules/.dependencies

.PHONY: test
test: test-unit test-sources test-cmd test-system
	@echo ""
	@echo -e "\033[01;32m✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓\033[0m"
	@echo ""

.PHONY: test-unit
test-unit: dependencies
	rm -fr tmp/unit
	mkdir -p tmp/unit
# Check reporters: https://nodejs.org/api/test.html#test-reporters
# --experimental-test-coverage
	node --import tsx/esm --harmony-temporal $(ARGS) --test test/unit/*-test.ts

.PHONY: test-unit-only
test-unit-only: clear dependencies
	ARGS="--test-only --watch --test-reporter=spec" make clear test-unit ok \
		| grep -v "# 'only' option not set"

test-unit-watch:
	ARGS="--watch" make clear test-unit ok

.PHONY: test-sources
test-sources: dependencies
	rm -fr tmp/sources
	mkdir -p tmp/sources
	node --import tsx/esm --harmony-temporal $(ARGS) --test test/sources/*-test.ts

.PHONY: test-cmd
test-cmd: test-cmd-dump test-cmd-info-all test-cmd-info-ts test-cmd-fix-one
	@echo "************** running test commands done ***************************"

test-cmd-dump: build
	@echo "************** dump "
	./bin/fo dump test/commands/data/

test-cmd-info-all: build
	@echo "************** info all "
	./bin/fo info test/commands/data/canon.JPG

test-cmd-info-ts: build
	@echo "************** info timestamp "
	./bin/fo info -k FileTimed_time test/commands/data/canon.JPG

test-cmd-fix-one: build
	@echo "************** fix one "
	@rm -fr tmp/cmd
	@mkdir -p tmp/cmd
	rsync -a test/commands/data/canon.JPG tmp/cmd/canon.JPG
	./bin/fo normalize tmp/cmd/canon.JPG

.PHONY: test-system
test-system: build
	rm -fr tmp/system
	jh-test-runner test/system/

.PHONY: eslint
lint: lint-typescript eslint prettier

.PHONY: lint-typescript
lint-typescript: dependencies
	node_modules/.bin/tsc --noEmit

.PHONY: eslint
prettier: dependencies
	prettier --list-different .

.PHONY: eslint
eslint: dependencies
	eslint --ext js,ts .

.PHONY: eslint-fix
eslint-fix: dependencies
	eslint --ext js,mjs . --fix

.PHONY: depcheck
depcheck: dependencies
	depcheck

.PHONY: circular
circular:
	npx madge --extensions ts --orphans src
	npx madge --extensions ts --circular src
