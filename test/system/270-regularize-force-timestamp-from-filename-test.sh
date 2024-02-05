#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

build_run_env

mv "basic/DSC_2506.MOV" "basic/2017-01-02 01-02-03 [DSC_2506].mov"
mv "basic/2018-01-02 03-04-05 my title [my original name].jpg" "basic/2017-01-02 03-04-09 my title [my original name].jpg"

fo_run normalize --timestamp-from-filename

assert_file \
    "basic/2017-01-02 01-02-03 Basic [DSC_2506].mov" \
    "basic/DSC_2506.MOV" \
    "2017:01:02 01:02:03" \
    "Basic"

assert_file \
    "basic/2019-03-24 12-14-37 Basic [IMG_20190324_121437].jpg" \
    "basic/IMG_20190324_121437.jpg" \
    "2019:03:24 12:14:37" \
    "Basic"

assert_file \
    "basic/2019-03-24 12-14-46 Basic [VID_20190324_121446].mp4" \
    "basic/VID_20190324_121446.mp4" \
    "2019:03:24 11:14:46" \
    "Basic"

assert_file \
    "basic/2017-01-02 03-04-09 My comment [my original name].jpg" \
    "basic/2018-01-02 03-04-05 my title [my original name].jpg" \
    "2017:01:02 03:04:09" \
    "My comment"

assert_file \
    "basic/2021-01-04 01-02-03 Basic.jpg" \
    "basic/2021-01-04 01-02-03 Vie de famille.jpg" \
    "2021:01:04 01:02:03" \
    "Basic"

# Faulty: No timestamp
assert_exists "2019 test/1.jpg"
file_handled "2019 test/1.jpeg"


# Faulty: no title in exif or filename
assert_exists "2019 test/Test [DSC_2506].mov"
file_handled "2019 test/DSC_2506.MOV"

assert_others_untouched
