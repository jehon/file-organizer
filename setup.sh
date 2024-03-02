#!/usr/bin/env bash

export DEBIAN_FRONTEND=noninteractive

SWD="$(realpath --physical "$(dirname "${BASH_SOURCE[0]}")")"
ROOT="$(dirname "$SWD")"

export PATH="$ROOT:$PATH"

root_or_sudo() {
    if [ $( id -u ) == 0 ]; then
        # In Docker
        "$@"
    else
        # On system
        sudo "$@"
    fi  
}

root_or_sudo apt update

root_or_sudo apt install --yes \
    git make libimage-exiftool-perl ffmpeg exiftran rsync

if [ -z "$PROD" ]; then
    # In the prod container, no need to have this
    curl -fsSL https://jehon.github.io/infrastructure/packages/jehon.deb --output jehon.deb
    root_or_sudo apt install --yes ./jehon.deb
fi
