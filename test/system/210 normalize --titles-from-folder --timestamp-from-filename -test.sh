#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

C="Test title"

build_run_env

fo_run normalize --title="$C"

assert_file \
    "basic/2019-09-19 07-48-25 $C [DSC_2506].mov" \
    "basic/DSC_2506.MOV" \
    "REF" \
    "$C"

assert_file \
    "basic/2019-03-24 12-14-38 $C [IMG_20190324_121437].jpg" \
    "basic/IMG_20190324_121437.jpg" \
    "REF" \
    "$C"

assert_file \
    "basic/2019-03-24 12-14-46 $C [VID_20190324_121446].mp4" \
    "basic/VID_20190324_121446.mp4" \
    "REF" \
    "$C"

assert_file \
    "basic/2018-01-02 03-04-05 $C [my original name].jpg" \
    "basic/2018-01-02 03-04-05 my title [my original name].jpg" \
    "REF" \
    "$C"

assert_file \
    "basic/2021-01-04 01-02-03 $C.jpg" \
    "basic/2021-01-04 01-02-03 Vie de famille.jpg" \
    "REF" \
    "$C"

# Faulty: No timestamp
assert_file \
    "2019 test/$C.jpg" \
    "2019 test/1.jpeg" \
    "0000:00:00 00:00:00" \
    "$C"


assert_file \
    "2019 test/2019-09-19 07-48-25 $C [DSC_2506].mov" \
    "2019 test/DSC_2506.MOV" \
    "REF" \
    "$C"

assert_others_untouched
