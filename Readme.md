# Inspiration

[![Build Status](https://travis-ci.com/jehon/file-organizer.svg?branch=master)](https://travis-ci.com/jehon/file-organizer)

This is a private project, but you are really free to:

- use it at your convenance
- clone it
- use it
- propose changes that would fit your need
- transform it into a public project
- make a donation to any charitative association (I like this one: https://www.souffledevie.be/)

## Objective

I have too much pictures in a complete mess. So I run this script to normalize them.

Manually, I organize my pictures by folders, each folder being named with the current event.

I run the script, and it does:

- use the folder name as a title and store it in the picture
- rename the pictures as yyyy-mm-dd dd-hh-ss title [original file name].extension

exiftool -v -DateTimeOriginal="2000:01:01 0" DSC_2506.MOV
