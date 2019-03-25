#!/usr/bin/env bash

D="$(dirname "${BASH_SOURCE[0]}")"

set -e

for f in "$D"/[0-9]-*.sh; do
    echo "Launching $f ---"
    $f 2>&1 3>&1 | jh-tag-stdin.sh "$( basename "$f" )"
done

# run-parts --regex="^[0-9]+-[a-z0-9\-]+\.sh$" --exit-on-error --verbose "$D"

