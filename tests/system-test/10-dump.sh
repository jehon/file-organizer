#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

run_and_capture "dump" "dump"
assert_captured_success
# capture_dump
capture_dump_to_file $TEST_DATA/output.log
capture_empty
