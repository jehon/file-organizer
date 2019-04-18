#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

pushd "$TEST_DATA" >/dev/null
"$EXEC" "regularize"
popd >/dev/null
