#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

build_run_env

# pwd does not end with / :-)
TO="$( pwd )"
FROM="${TO}-from"

rm -fr "${FROM}"
mv -v "${TO}" "${FROM}"
mkdir "${TO}"

# Create a legacy mark
touch "${TO}/2019-06-01 03-04-05.jpg"

fo_run import --to "${TO}" "${FROM}"

cd "${TO}"
assert_equals "Number of files imported" "5" "$( find "." -maxdepth 1 -type f | wc -l )"
assert_equals "Number of files legacy" "3"   "$( find "legacy" -type f | wc -l )"

assert_exists "legacy/2018-01-02 03-04-05 My title [my original name].jpg"
assert_exists "2021-01-04 01-02-03 Vie de famille.jpg"
