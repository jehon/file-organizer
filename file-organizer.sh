#!/usr/bin/env bash

set -e

SWD="$( dirname "$( realpath -P "${BASH_SOURCE[0]}" )" )"

"$SWD/src/main/main.js" "$@"
