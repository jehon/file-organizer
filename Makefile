#!/usr/bin/env make

#
#
# Default target
#
#
auto:

#
#
# Generic configuration
#
#

# https://ftp.gnu.org/old-gnu/Manuals/make-3.79.1/html_chapter/make_7.html
# https://stackoverflow.com/a/26936855/1954789
SHELL := /bin/bash
.SECONDEXPANSION:

PATH := $(shell npm bin):$(PATH)

#
#
# System variables
#
#
ROOT   ?= $(shell dirname $(abspath $(lastword $(MAKEFILE_LIST))))

.PHONY: dump
dump:
	$(info ROOT:      $(ROOT))
	$(info PATH:      $(PATH))

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

setup:
#   sudo apt install


######################
#
# Runtime
#
######################

.PHONY: clean
clean:
	rm -fr tmp node_modules

# .PHONY: start
# start: build
# 	electron .

start-test-headless: build
	mkdir -p tmp/gui
	cd tmp/gui && ../../reset.sh
	cd tmp/gui && ../../file-organizer.sh dump

start-test-gui: build
	mkdir -p tmp/gui
	cd tmp/gui && ../../reset.sh
	cd tmp/gui && ../../file-organizer.sh regularize -n

start-demo: build
	electron src/demo.cjs

start-test-info: build
	./src/main.cjs info --headless "test/data/1998-12-31 12-10-11 exifok01.jpg"

.PHONY: build
build: dependencies
	chmod +x ./file-organizer.sh

.PHONY: dependencies
dependencies: node_modules/.dependencies
node_modules/.dependencies: package.json package-lock.json
	npm install
	touch package-lock.json
	touch node_modules/.dependencies

.PHONY: test
test: test-unit test-system
	@echo ""
	@echo -e "\033[01;32m✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓\033[0m"
	@echo ""

.PHONY: test-unit
test-unit: build
	nyc jasmine --config=test/unit/jasmine.json

.PHONY: test-unit-continuously
test-unit-continuously: build
	watch "make test-unit" src file-organizer test/unit

.PHONY: test-system
test-system: build
	xvfb-run jasmine --config=test/system/jasmine.json


.PHONY: eslint
lint: eslint

.PHONY: eslint
eslint: dependencies
	eslint .

.PHONY: eslint-fix
eslint-fix: dependencies
	eslint . --fix

.PHONY: depcheck
depcheck: dependencies
	depcheck
