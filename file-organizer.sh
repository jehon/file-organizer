#!/usr/bin/env bash

set -e
set -o pipefail
# set -x

SWD="$( dirname "$0")"
# echo "SWD: $SWD"

"$SWD"/node_modules/.bin/electron "$SWD"/src/main.cjs "$@" |& grep -v "ExperimentalWarning"
