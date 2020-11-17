#!/usr/bin/env bash

# set -e
set -o pipefail

SWD="$( dirname "$( realpath -P "${BASH_SOURCE[0]}" )" )"

( "$SWD/node_modules/.bin/electron" "$SWD" "$@" 3>&1 1>&2 2>&3 | ( grep -v "ExperimentalWarning" || true )) 3>&1 1>&2 2>&3
