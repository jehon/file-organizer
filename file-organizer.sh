#!/usr/bin/env bash

echo "Inside file-organizer.sh"

set -e
# set -x

SWD="$( dirname "$0")"
# echo "SWD: $SWD"

"$SWD"/node_modules/.bin/electron "$SWD"/file-organizer/main.js "$@"
