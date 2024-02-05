#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

build_run_env

# Empty file to be handled
touch "basic/empty.jpg"

# Faulty: No timestamp
rm -f "2019 test/1.jpeg"
file_handled "2019 test/1.jpeg"

fo_run normalize

assert_file \
    "basic/2019-09-19 07-48-25 Basic [DSC_2506].mov" \
    "basic/DSC_2506.MOV" \
    "REF" \
    "Basic"

assert_file \
    "basic/2019-03-24 12-14-38 Basic [IMG_20190324_121437].jpg" \
    "basic/IMG_20190324_121437.jpg" \
    "REF" \
    "Basic"

assert_file \
    "basic/2019-03-24 12-14-46 Basic [VID_20190324_121446].mp4" \
    "basic/VID_20190324_121446.mp4" \
    "REF" \
    "Basic"

assert_file \
    "basic/2018-01-02 03-04-05 My comment [my original name].jpg" \
    "basic/2018-01-02 03-04-05 my title [my original name].jpg" \
    "REF" \
    "My comment"

assert_file \
    "basic/2021-01-04 01-02-03 Basic.jpg" \
    "basic/2021-01-04 01-02-03 Vie de famille.jpg" \
    "REF" \
    "Basic"

assert_file \
    "2019 test/2019-09-19 07-48-25 Test [DSC_2506].mov" \
    "2019 test/DSC_2506.MOV" \
    "REF" \
    "Test"

assert_others_untouched
