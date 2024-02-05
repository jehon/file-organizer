import { withFirstUpperCase } from "../helpers/string-helpers";
import { ARCHIVE_FOLDERNAME } from "../lib/constants";
import { parseFilename } from "../lib/timestamp";
import Value, { currentCalculatedValueFactory } from "../lib/value";
import File from "./file";
import FileFolder from "./file-folder";

export default class FileTimed extends File {
  i_ft_parsing_ok: Value<boolean>;
  i_ft_has_timestamp: Value<boolean>;
  i_ft_has_title: Value<boolean>;
  i_ft_is_coherent: Value<boolean>;

  constructor(filename: string, parent: FileFolder) {
    super(filename, parent);
    // We don't follow, because it is specifically oriented on 'initial'
    this.i_ft_parsing_ok = currentCalculatedValueFactory(
      "FileTimed: Parsing must be ok",
      () => this.i_f_parsed_type.current != "invalid"
    );

    this.i_ft_has_timestamp = currentCalculatedValueFactory(
      "FileTimed: Timestamp must be present",
      () => !this.i_f_time.current.isEmpty()
    );

    this.i_ft_has_title = currentCalculatedValueFactory(
      "FileTimed: Title must be present",
      () => this.i_f_title.current > ""
    );

    // Parse the qualif filename to see if it is a timestamp too
    // and take it as the source of thruth if applicable
    if (this.i_f_qualif.current) {
      const ts2 = parseFilename(this.i_f_qualif.current).time;
      if (!ts2.isEmpty()) {
        this.i_f_time.expect(ts2, "parse the qualif instead of the timestamp");
      }
    }

    //
    // Enforce that the title start with uppercase
    //
    this.i_f_title.withCanonize((v) => withFirstUpperCase(v));

    /**********************
     * Check coherence with parent element
     */

    this.i_ft_is_coherent = currentCalculatedValueFactory(
      "FileTimed: Timestamps must be coherents",
      () => {
        if (this.isTop()) {
          // No parent => always good
          return true;
        }

        if (
          this.getParentValue().expected.i_f_qualif.expected ==
          ARCHIVE_FOLDERNAME
        ) {
          // The folder say it is an archive
          return true;
        }

        if (
          this.i_f_time.current.isEmpty() ||
          this.getParentValue().expected.i_f_time.current.isEmpty()
        ) {
          // - No time inside => always good
          // - Parent has not timestamp => always good
          //       parent time can not change (prohibited)
          return true;
        }

        return this.i_f_time.current.isMorePreciseThan(
          this.getParentValue().current.i_f_time.current,
          true
        );
      }
    );

    /****************************************
     * Force/Guess/Transfert missing values
     */

    if (!this.i_f_title.expected) {
      this.i_f_title.expect(
        this.getParentValue().expected.i_f_title.current,
        "FileTimed: Taking the title from the parent folder"
      );
    }

    if (
      !this.i_f_time.expected.isEmpty() &&
      !this.i_f_time.expected.isDateTimeFull()
    ) {
      if (this.getMTime().isMorePreciseThan(this.i_f_time.expected, true)) {
        this.i_f_time.expect(this.getMTime(), "Using more precise mtime");
      }
    }
  }
}
