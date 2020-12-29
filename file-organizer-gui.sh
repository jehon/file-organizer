#!/usr/bin/env bash

SWD="$( dirname "$( realpath -P "${BASH_SOURCE[0]}" )" )"

# set -o pipefail
# ( "$SWD/node_modules/.bin/electron" "$SWD" "$@" 3>&1 1>&2 2>&3 | ( grep -v "ExperimentalWarning" || true )) 3>&1 1>&2 2>&3

# We don't care about the warning since we anyway have the gui :-)
set -e
"$SWD/node_modules/.bin/electron" "$SWD" "$@"
