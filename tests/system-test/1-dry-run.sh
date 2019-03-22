#!/usr/bin/env bash

T="$(basename "${BASH_SOURCE[0]}")"
. ./helpers.sh

setup "$T"

checkConsistency