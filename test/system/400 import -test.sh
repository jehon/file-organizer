#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

build_run_env

touch -d "2019-1-2 3:04:05" "2019 test/1.jpeg"

# pwd does not end with / :-)
TO="$( pwd )"
FROM="${TO}-from"

rm -fr "${FROM}"
mv -v "${TO}" "${FROM}"
mkdir "${TO}"

fo_run import --to "${TO}" "${FROM}"

cd "${TO}"
assert_equals "Number of files" "7" "$( find "." -type f | wc -l )"

assert_exists "2019-01-02 03-04-05 1 [ts-guessed].jpg"
assert_exists "2019-09-19 07-48-25 [DSC_2506].mov"
assert_exists "2018-01-02 03-04-05 My title [my original name].jpg"
