#!/usr/bin/env bash

set -o errexit
set -o pipefail
shopt -s nullglob

# shellcheck source-dir=SCRIPTDIR
. "$(dirname "$( realpath "${BASH_SOURCE[0]}")")"/test-lib.sh

build_run_env

# We will force the TS and the Title based on the filename, to create an artificial clash
# with the IMG_20190324_121437.jpg file

mv \
  "basic/2018-01-02 03-04-05 my title [my original name].jpg" \
  "basic/2019-03-24 12-14-37 basic [IMG_20190324_121437].jpg"

fo_run normalize --title-from-folder --timestamp-from-filename

# Blocking file (renamed in the beforeEach section)
assert_exists "basic/2019-03-24 12-14-37 Basic [IMG_20190324_121437].jpg"

# File that should be renamed
assert_exists "basic/2019-03-24 12-14-37 Basic.jpg"