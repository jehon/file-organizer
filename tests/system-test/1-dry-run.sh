#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

checkConsistency

runItAndCapture "help" --help
assert_captured_success

runItAndCapture "incorrect arguments" -blabla
assert_true "Should be in error" "$( [[ $CAPTURED_EXITCODE -gt 0 ]] )"

runItAndCapture "dry-run" -n
assert_captured_success

capture "No file are modified" rsync -r --delete "$ORIG_DATA" "$TEST_DATA"
assert_equal "No file are modified" "" "$CAPTURED_OUTPUT"

