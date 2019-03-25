#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

run_and_capture "no options"
assert_captured_success
# capture_dump
capture_dump_to_file $TEST_DATA/output.log
capture_empty

# find "$TEST_DATA" -type f

assert_consistency
assert_file_not_exists "2019 test/2019-03-24 12-14-38 [IMG_20190324_121437].jpg"
assert_file_exists "2019 test/2019-03-24 12-14-46 [VID_20190324_121446].mp4"
assert_file_exists "other test/2018-01-02 03-04-05 my comment [1].jpg"
assert_file_not_exists "other test/2019-03-24 12-14-55 [IMG_20190324_121454].jpg"
