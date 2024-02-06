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

# Create a target file
touch "${TO}/2019-01-02 03-04-05.jpg"

fo_run import --to "${TO}" "${FROM}"

