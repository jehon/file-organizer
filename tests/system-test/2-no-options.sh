#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

runItAndCapture "no options" -n
assert_captured_success
capture_dump
capture_dump_to_file $TEST_DATA/output.log
capture_empty

capture "No file are modified" rsync -r --delete "$ORIG_DATA" "$TEST_DATA"
assert_equal "No file are modified" "" "$CAPTURED_OUTPUT"
capture_dump_to_file $TEST_DATA/output.log
capture_empty
