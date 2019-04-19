#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

mv "$TEST_DATA/other test/IMG_20190324_121454.jpg" "$TEST_DATA/other test/IMG_20190300_000000.jpg"

run_and_capture "set-timestamp" "regularize" "--set-timestamp" "--fcff"
assert_captured_success
#capture_dump
capture_dump_to_file $TEST_DATA/output.log
capture_empty

# find "$TEST_DATA" -type f

assert_consistency

assert_exiv_timestamp "other test/2019-03 other test [IMG_20190300_000000].jpg" "2019-03-01"
