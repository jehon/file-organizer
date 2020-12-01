#!/usr/bin/env bash

SWD="$( dirname "$( realpath -P "${BASH_SOURCE[0]}" )" )"

set -o pipefail
( "$SWD/src/main/main.js" "$@" 3>&1 1>&2 2>&3 | ( grep -v "ExperimentalWarning" || true )) 3>&1 1>&2 2>&3

# set -e
# "$SWD/src/main/main.js" "$@"
