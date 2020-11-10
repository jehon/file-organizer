#!/usr/bin/env bash

# set -e
# set -o pipefail

SWD="$( dirname "$0")"

"$(npm bin)"/electron "$SWD" "$@"
