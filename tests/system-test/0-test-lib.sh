#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

assert_consistency
assert_file_exists    "other test/1.jpeg"
assert_exiv_timestamp "other test/1.jpeg" "2018-01-02 03-04-05"
assert_exiv_comment   "other test/1.jpeg" "my comment"

assert_file_exists    "other test/2.jpeg"
assert_exiv_timestamp "other test/2.jpeg" ""
assert_exiv_comment   "other test/2.jpeg" ""
