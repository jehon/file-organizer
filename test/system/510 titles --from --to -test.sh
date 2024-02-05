#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

build_run_env "500 titles -test.sh"

fo_run "titles" --from="my title" --to="new title"

echo "${REF_LIST[*]}"

assert_file \
    "basic/2018-01-02 03-04-05 New title [my original name].jpg" \
    "basic/2018-01-02 03-04-05 my title [my original name].jpg" \
    "REF" \
    "New title"

assert_others_untouched
