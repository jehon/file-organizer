#!/usr/bin/env bash

SELF="$(realpath "$(dirname "${BASH_SOURCE[0]}" )" )"
TEST_ROOT="$(dirname "$SELF")"
ROOT="$(dirname "$TEST_ROOT")"
TMP="$ROOT/tmp"
TMP_DATA="$TMP/st"

# echo "ROOT:     $ROOT"
# echo "TMP_DATA: $TMP_DATA"

setup() {
    echo "## setup $1"
    mkdir -p "$TMP_DATA"
    rsync -r --delete "$TEST_ROOT/data/system_test/" "$TMP_DATA"
}

checkFileExists() {
    echo checkFileExists
    
}

checkExivComment() {
    echo checkExivComment

}

checkExivDate() {
    echo checkExivDate
}
