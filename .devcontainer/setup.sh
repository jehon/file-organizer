#!/usr/bin/env bash

export DEBIAN_FRONTEND=noninteractive

SWD="$(realpath --physical "$(dirname "${BASH_SOURCE[0]}")")"
ROOT="$(dirname "$SWD")"

export PATH="$ROOT:$PATH"

apt update

apt install --yes git make libimage-exiftool-perl ffmpeg exiftran rsync

if [ -z "$PROD" ]; then
    curl -fsSL https://jehon.github.io/packages/jehon.deb --output jehon.deb
    apt install --yes ./jehon.deb
fi
