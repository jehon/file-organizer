import fs from "fs";

import Value from "../lib/value";
import FileExif from "./file-exif";
import FileFolder from "./file-folder";

export default (
  cls: typeof FileExif,
  newExtension: string,
  transformFn: (oldFn: string, newFn: string) => Promise<string> | string
): typeof FileExif =>
  class extends cls {
    i_00_fmc_conversion: Value<boolean>;

    constructor(filename: string, parent: FileFolder) {
      super(filename, parent);

      this.i_f_extension.expect(newExtension, "FileMovieConvert: conversion");

      if (this.i_f_time.expected.isEmpty()) {
        this.i_f_time.expect(
          this.getMTime(),
          "FileMovieConvert: from file modification time"
        );
      }

      this.i_00_fmc_conversion = new Value(false)
        .withExpectedFrozen(true)
        .withFix(
          async (_val) => {
            const oldFn = this.i_f_path_full.current;
            const newFn = this.i_f_path_full.expected;
            this.i_00_fmc_conversion.fixed();

            await transformFn(oldFn, newFn);
            await fs.promises.unlink(oldFn);
            this.i_f_path_full.fixed();

            await this.i_f_time.runFixValue();
            await this.i_fe_time.runFixValue();
          },
          [this.i_f_path_full]
        );

      return this;
    }
  };
