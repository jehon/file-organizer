#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

runItAndCapture "guess comments" --guess-comments
assert_captured_success
capture_dump
capture_dump_to_file $TEST_DATA/output.log
capture_empty
