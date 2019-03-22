#!/usr/bin/env bash

D="$(dirname "${BASH_SOURCE[0]}")"

run-parts --regex="^[0-9]+-[a-z0-9\-]+\.sh$" --exit-on-error --verbose "$D"
