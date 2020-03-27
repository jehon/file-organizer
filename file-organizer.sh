#!/usr/bin/env bash

set -e
set -x

SWD="$( dirname "$0")"
echo "SWD: $SWD"

"$SWD"/node_modules/.bin/electron "$SWD"/file-organizer/main.js "$@"
