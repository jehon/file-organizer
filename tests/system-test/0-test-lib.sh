#!/usr/bin/env bash

. "$(dirname "${BASH_SOURCE[0]}")/helpers.sh"

T="$(basename "${BASH_SOURCE[0]}")"

setup "$T"

checkConsistency
checkFileExists    "other test/1.jpeg"
checkExivTimestamp "other test/1.jpeg" "2018-01-02 03-04-05"
checkExivComment   "other test/1.jpeg" "my comment"

checkFileExists    "other test/2.jpeg"
checkExivTimestamp "other test/2.jpeg" ""
checkExivComment   "other test/2.jpeg" ""
