#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

checkConsistency

runItAndCapture "help" --help
assert_captured_success

runItAndCapture "dry-run" -n
assert_captured_success

runItAndCapture "incorrect arguments" -blabla
assert_true "Should be in error" "$( [[ $CAPTURED_EXITCODE -gt 0 ]] )"
