#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

build_run_env "500 titles -test.sh"

fo_run "titles" --from=test --to=high

assert_file \
    "2019 high/1.jpeg" \
    "2019 test/1.jpeg" \
    "REF" \
    "REF"

assert_file \
    "2019 high/DSC_2506.MOV" \
    "2019 test/DSC_2506.MOV" \
    "REF" \
    "REF"

assert_others_untouched
