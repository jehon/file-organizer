#!/usr/bin/env bash

SWD="$( realpath "$( dirname "$0")" )"

"$SWD"/node_modules/.bin/electron "$SWD"/file-organizer/main.js "$@"
