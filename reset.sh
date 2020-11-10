#!/usr/bin/env bash

if [ "$1" != "" ]; then
    mkdir -p "$1"
    cd "$1"
fi

if [ -r src ]; then
    echo "In the main folder, are you foolish ?"
    exit 1
fi

rsync -a --delete -i ../../test/data/system_test/ .
