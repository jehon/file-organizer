#!/usr/bin/env bash

. jh-lib.sh

SELF="$(realpath "$(dirname "${BASH_SOURCE[0]}" )" )"
ROOT="$(dirname "$( dirname "$SELF" )" )"
TMP="$ROOT/tmp"
ORIG_DATA="$ROOT/tests/data/system_test/"

EXEC="$ROOT/file-organizer/main.js"

log_debug "ROOT:      $ROOT"
log_debug "TEST_DATA: $TEST_DATA"
log_debug "ORIG_DATA: $ORIG_DATA"
log_debug "EXEC:      $EXEC"

assert_true "Exec $EXEC is runnable" "$([[ -x "$EXEC" ]])"

setup() {
    log_info "## setup $1"
    TEST_DATA="$TMP/$T"
    mkdir -p "$TEST_DATA"
    rsync -r --delete "$ORIG_DATA" "$TEST_DATA"
}

run_and_capture() {
    pushd "$TEST_DATA" >/dev/null
    HEADER="$1"
    shift
    capture "Run $HEADER" "$EXEC" "--no-interactive" "$@"
    RES=$?
    popd >/dev/null
    return $RES
}

assert_consistency() {
    ON=$(find "$ORIG_DATA/2019 test" -type f | wc -l)
    TN=$(find "$TEST_DATA/2019 test" -type f | wc -l)
    assert_true "2019 test: same number of files" "$([ "$ON" == "$TN" ])"

    ON=$(find "$ORIG_DATA/other test" -type f | wc -l)
    TN=$(find "$TEST_DATA/other test" -type f | wc -l)
    assert_true "other test: same number of files" "$([ "$ON" == "$TN" ])"
}

assert_file_exists() {
    local F="$2"
    if [ "$2" == "" ]; then
        F="$1"
    fi
    assert_true "$1: exists" "$([[ -r "$TEST_DATA/$F" ]])"
}

assert_file_not_exists() {
    local F="$2"
    if [ "$2" == "" ]; then
        F="$1"
    fi
    assert_true "$1: not exists" "$([[ ! -r "$TEST_DATA/$F" ]])"
}

assert_exiv_timestamp() {
    assert_file_exists "$1: assert_exiv_timestamp" "$1"
    D="$( $EXEC info "picture.exiv.timestamp" "$TEST_DATA/$1" )"
    assert_equal "$1: Exiv timestamp" "$2" "$D"
}

assert_exiv_comment() {
    assert_file_exists "$1: assert_exiv_comment" "$1"
    D="$( $EXEC info "picture.exiv.comment" "$TEST_DATA/$1" )"
    assert_equal "$1: Exiv comment" "$2" "$D"
}
