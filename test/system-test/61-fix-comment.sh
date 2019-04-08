#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

run_and_capture "fix-comment" "regularize" "--fix-comment"
assert_captured_success
# capture_dump
capture_dump_to_file $TEST_DATA/output.log
capture_empty

# find "$TEST_DATA" -type f

assert_consistency

assert_file_exists  "2019 test/2019-03-24 12-14-38 test [IMG_20190324_121437].jpg"
assert_exiv_comment "2019 test/2019-03-24 12-14-38 test [IMG_20190324_121437].jpg" "test"

assert_file_exists  "2019 test/2019-03-24 12-14-46 test [VID_20190324_121446].mp4"

assert_file_exists  "other test/2018-01-02 03-04-05 my incoherent comment [my original name].jpg"
assert_exiv_comment "other test/2018-01-02 03-04-05 my incoherent comment [my original name].jpg" "my incoherent comment"

