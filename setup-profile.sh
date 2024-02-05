#!/usr/bin/bash

# We only export bin folder

SWF="${BASH_SOURCE[0]}"
if [[ "$SWF" == "" ]]; then
    # shellcheck disable=SC2296
    SWF="${(%):-%N}"
fi

SWD="$(dirname "${SWF}")"

if [ -n "$SWD" ]; then
    # We only expose "bin"
    LOCAL_BIN="${SWD}/bin"
    echo "Path: Adding '$LOCAL_BIN'"
    export PATH="$LOCAL_BIN:$PATH"
fi
