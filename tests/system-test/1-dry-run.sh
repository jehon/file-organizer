#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

assert_consistency

log_info "## help"
run_and_capture "help" --help
assert_captured_success
capture_dump_to_file $TEST_DATA/output.log
capture_empty

log_info "## Incorrect options"
run_and_capture "incorrect arguments" -blabla
assert_true "Should be in error" "$( [[ $CAPTURED_EXITCODE -gt 0 ]] )"
capture_dump_to_file $TEST_DATA/output.log
capture_empty

log_info "## Dry run"
run_and_capture "dry-run" -n
assert_captured_success
capture "No file are modified" rsync -r --delete "$ORIG_DATA" "$TEST_DATA"
assert_equal "No file are modified" "" "$CAPTURED_OUTPUT"
capture_dump_to_file $TEST_DATA/output.log
capture_empty
