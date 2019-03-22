#!/usr/bin/env bash

. jh-lib.sh

SELF="$(realpath "$(dirname "${BASH_SOURCE[0]}" )" )"
ROOT="$(dirname "$( dirname "$SELF" )" )"
TMP="$ROOT/tmp"
ORIG_DATA="$ROOT/tests/data/system_test/"

EXEC="$ROOT/file-organizer/main.js"

T="init"

log_debug "[$T] ROOT:      $ROOT"
log_debug "[$T] TEST_DATA: $TEST_DATA"
log_debug "[$T] ORIG_DATA: $ORIG_DATA"
log_debug "[$T] EXEC:      $EXEC"

assert_true "[$T] Exec $EXEC is runnable" "$([[ -x "$EXEC" ]])"

setup() {
    log_info "## setup $1"
    T="$1"
    TEST_DATA="$TMP/$T/st"
    mkdir -p "$TEST_DATA"
    rsync -r --delete "$ORIG_DATA" "$TEST_DATA"
}

runIt() {
    pushd "$TEST_DATA"
    $EXEC "$@"
    popd
}

checkConsistency() {
    ON=$(find "$ORIG_DATA/2018 test" -type f | wc -l)
    TN=$(find "$TEST_DATA/2018 test" -type f | wc -l)
    assert_true "[$T] 2018 test: same number of files" "$([ "$ON" == "$TN" ])"

    ON=$(find "$ORIG_DATA/other test" -type f | wc -l)
    TN=$(find "$TEST_DATA/other test" -type f | wc -l)
    assert_true "[$T] other test: same number of files" "$([ "$ON" == "$TN" ])"
}

checkFileExists() {
    local F="$2"
    if [ "$2" == "" ]; then
        F="$1"
    fi
    assert_true "[$T] $1: exists" "$([[ -r "$TEST_DATA/$F" ]])"
}

checkExivTimestamp() {
    checkFileExists "$1: checkExivTimestamp" "$1"
    D="$( $EXEC info "picture.exiv.timestamp" "$TEST_DATA/$1" )"
    assert_equal "[$T] $1: Exiv timestamp" "$2" "$D"
}

checkExivComment() {
    checkFileExists "$1: checkExivComment" "$1"
    D="$( $EXEC info "picture.exiv.comment" "$TEST_DATA/$1" )"
    assert_equal "[$T] $1: Exiv comment" "$2" "$D"
}
