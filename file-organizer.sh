#!/usr/bin/env bash

# set -e
set -o pipefail

SWD="$( dirname "$0")"

# "$(npm bin)"/electron "$SWD" "$@"

( "$(npm bin)"/electron "$SWD" "$@" 3>&1 1>&2 2>&3 | ( grep -v "ExperimentalWarning" || true )) 3>&1 1>&2 2>&3
