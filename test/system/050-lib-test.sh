#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

cd "${ORIGINAL_DATA}"

REF="basic/DSC_2506.MOV"
assert_exif_time "${REF}" "2019:09:19 07:48:25"
assert_exif_desc "${REF}" ""

assert_exists "${REF}"
assert_exif_time "${REF}" "$( ref_time "${REF}" )"
assert_exif_desc "${REF}" "$( ref_desc "${REF}" )"
assert_untouched "${REF}"

assert_others_untouched

build_run_env

ok "It did change folder" test $( basename "$( pwd )" ) == "$( basename "$0" )"]

assert_others_untouched
