#!/usr/bin/env bash

D="$(dirname "${BASH_SOURCE[0]}")"
. "$D"/helpers.sh

set -e
set -o pipefail

for f in "$D"/[0-9][0-9]-*.sh; do
    log_info "Launching $f"
    if ! $f 2>&1 3>&1 ; then
        log_failure "Running $f failure"
        exit 5
    fi
    log_success "Running $f done"
done
