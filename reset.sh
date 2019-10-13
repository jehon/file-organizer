#!/usr/bin/env bash

if [ "$1" != "" ]; then
    mkdir -p "$1"
    cd "$1"
fi

rsync -a --delete -i ../../test/data/system_test/ .
