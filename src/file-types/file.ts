import chalk from "chalk";
import fs, { Stats } from "node:fs";
import path from "node:path";
import { fsFileRename } from "../helpers/fs-helpers";
import { writeLine } from "../helpers/tui-helpers";
import { Equalable } from "../lib/equalable";
import { GenericTime } from "../lib/generic-time";
import Item from "../lib/item";
import { parseFilename } from "../lib/timestamp";
import Value, { Flavor } from "../lib/value";
import FileFolder from "./file-folder";

export type OptionsPrint = {
  includesActions?: boolean;
  includesInfos?: boolean; // if true, print also untouched values
  includesCalculated?: boolean; // - if true, print also untouched values
  includes?: Array<string>;
  excludes?: Array<string>;
};

export function buildFilename(
  time: GenericTime,
  title: string,
  qualif: string,
  extension: string
) {
  let canonicalFilename = "";

  if (!time.isEmpty()) {
    canonicalFilename += time.to2x3StringForHuman();
    canonicalFilename = canonicalFilename.trim();
  }

  if (title) {
    canonicalFilename += " " + title;
    canonicalFilename = canonicalFilename.trim();
  }

  if (qualif) {
    if (canonicalFilename == "") {
      // Avoid having a name like "[blabla]"
      canonicalFilename = qualif;
      canonicalFilename.trim();
    } else {
      canonicalFilename += " [" + qualif + "]";
      canonicalFilename.trim();
    }
  }

  if (extension) {
    canonicalFilename += extension;
    canonicalFilename.trim();
  }

  return canonicalFilename;
}

class FolderReservation extends Equalable {
  folder: FileFolder;
  filename: string;

  constructor(folder: FileFolder, filename: string) {
    super();
    this.folder = folder;
    this.filename = filename;
  }

  toString() {
    return `${this.folder.i_f_path_full.current}#${this.filename}`;
  }

  equals(t: FolderReservation): boolean {
    return this.folder == t.folder && this.filename == t.filename;
  }
}

/**
 * How does this work?
 *
 * - buildFile()
 *      will make the full "readonly" analysis
 *      will build up info (and values-problems)
 *      - initial (=current) and expected
 *
 * - runAllFixes()
 *      is only based on values
 *      the only "write" part of the process
 *      values{}.fixed() (expected -> current)
 *
 */
export default class File extends Item {
  // ------------------------------------------
  //
  // Public properties
  //
  // ------------------------------------------

  i_00_f_exists: Value<boolean>;
  i_f_path_full: Value<string>; // The full path to the file
  i_f_is_folder: Value<boolean | undefined>;
  i_f_filename: Value<string>;
  i_f_title: Value<string>; // In the filename, the title part
  i_f_qualif: Value<string>; // In the filename, the qualif filename part (without the [])
  i_f_time: Value<GenericTime>; // In the filename, the timestamp part as in the filename, thus in "local time"
  i_f_extension: Value<string>; // ".blabla" (always have a dot: .blabla)
  i_f_parsed_type: Value<string>;
  i_reservation: Value<FolderReservation>;

  stats: Stats;

  constructor(filename: string, parent: Item) {
    if (filename != "/" && path.basename(filename) !== filename) {
      throw new Error(
        `Filename is complex: ${filename} vs ${path.basename(filename)}`
      );
    }
    const absoluteGivenFilepath = path.join(
      parent.isTop() ? "/" : (parent as FileFolder).i_f_path_full.current,
      filename
    );

    /**
     *
     *  Title: filepath
     *  Set the parent
     *
     */
    super(filename, parent);

    /**
     *
     * Handle folder and existence
     *
     * Require: none
     * Fix: require I_FULL_PATH
     *
     * Note: throwIfNoEntry -> will return null if file does not exists
     *
     */
    this.stats = fs.statSync(absoluteGivenFilepath);
    const isFolder: boolean = this.stats.isDirectory();

    this.i_f_is_folder = new Value<boolean | undefined>(isFolder);
    this.i_00_f_exists = new Value(true) // Allow delete (see file-delete)
      .expect(true, "File: must exists")
      .withFix(async (v) => {
        const vIsFolder = this.i_f_is_folder;
        if (v.current && !v.expected) {
          if (vIsFolder.current) {
            await fs.promises.rmdir(this.i_f_path_full.current);
            v.fixed();
          } else {
            await fs.promises.unlink(this.i_f_path_full.current);
            v.fixed();
          }
          // When deleting a file, all values are de-facto fixed
          this.getAllValues().forEach((v) => v.fixed());
        }

        if (!v.current && v.expected) {
          if (vIsFolder.expected) {
            await fs.promises.mkdir(this.i_f_path_full.expected, {
              recursive: true
            });
            v.fixed();
            vIsFolder.fixed();
          }
        }
      });

    /**
     * Filename of the file (with extension)
     *
     * Modified only by 'rename'
     *    Particularities are calculated based on filename.
     *    Expected is updated based on particularities.
     *
     * Require: i_00_f_exists
     */
    const parsed = parseFilename(path.parse(filename).name);

    this.i_f_time = new Value<GenericTime>(parsed.time ?? GenericTime.empty());
    this.i_f_title = new Value(parsed.title ?? "");
    this.i_f_qualif = new Value(parsed.qualif ?? ""); // Contain the "index", but updated by i_f_path_full
    this.i_f_extension = new Value(path.parse(absoluteGivenFilepath).ext ?? "");
    this.i_f_parsed_type = new Value(parsed.type ?? "");

    this.i_f_filename = new Value(
      path.parse(absoluteGivenFilepath).base
    ).withExpectedCalculated(() => {
      // The initial name is the parsed data
      // If we are a folder, we can not change the name
      // if (this.i_f_is_folder.expected) {
      //   return path.parse(absoluteGivenFilepath).base;
      // }

      return buildFilename(
        this.i_f_time.expected,
        this.i_f_title.expected,
        this.i_f_qualif.expected,
        this.i_f_extension.expected
      );
    }, [this.i_f_time, this.i_f_title, this.i_f_qualif, this.i_f_extension]);

    /**
     *
     * Full path of the file
     *
     * Require: i_parent, File._F_FILENAME
     *
     */
    this.i_f_path_full = new Value(
      path.join(
        this.getParentValue().initial.isTop()
          ? "/"
          : this.getParentValue().initial.i_f_path_full.initial,
        this.i_f_filename.initial
      )
    )
      .withExpectedCalculated(
        () =>
          path.join(
            this.getParentValue().initial.isTop()
              ? "/"
              : this.getParentValue().expected.i_f_path_full.current,
            this.i_f_filename.expected
          ),
        [this.i_parent, this.i_f_filename]
      )
      .withFix(
        (v) => {
          // If we don't expect file to exists at the end, we don't change it...
          if (this.i_00_f_exists.expected) {
            /**
             * First step: calculate the new index
             *
             *    - get a free index in knownFiles
             */
            fsFileRename(v.current, v.expected);

            // Unregister previously current reservation
            this.i_reservation.current.folder.unregisterFile(
              this,
              this.i_reservation.current.filename,
              Flavor.current
            );

            this.i_reservation.fixed();

            // Register new current reservation
            this.i_reservation.current.folder.registerFile(
              this,
              this.i_reservation.current.filename,
              Flavor.current
            );
          }
          v.fixed();
        },
        [
          this.i_parent,
          this.i_f_filename,
          this.i_f_time,
          this.i_f_title,
          this.i_f_qualif,
          this.i_f_extension
        ]
      )
      .onExpectedChanged(
        () => {
          //
          // Difficulty: by changing the File.i_f_qualif, we will trigger this again.
          // To avoid cycles, we check for changes.
          //
          const newQualif =
            this.getParentValue().expected.getAvailableIndexedQualif(this);
          if (newQualif != this.i_f_qualif.expected) {
            this.i_f_qualif.expect(newQualif);
            // When the qualif is ok, reservation will be taken
            return;
          }

          // Unregister previously expected folder
          this.i_reservation.expected.folder.unregisterFile(
            this,
            this.i_reservation.expected.filename,
            Flavor.expected
          );

          this.i_reservation.expect(
            new FolderReservation(
              this.getParentValue().expected,
              this.i_f_filename.expected
            )
          );

          // Register new expected folder
          this.i_reservation.expected.folder.registerFile(
            this,
            this.i_reservation.expected.filename,
            Flavor.expected
          );
        },
        // We don't trigger imediately, initializeReservation will do it for us
        false
      );

    // Need File.i_f_path_full and other informations
    this.i_reservation = new Value(
      new FolderReservation(
        this.getParentValue().initial,
        this.i_f_filename.initial
      )
    );
    if (!this.getParentValue().initial.isTop()) {
      this.i_reservation.initial.folder.registerFile(
        this,
        this.i_reservation.initial.filename,
        Flavor.initial
      );
    }

    // Lowercase extension
    const currentExtension = this.i_f_extension.current;
    if (currentExtension.toLowerCase() != currentExtension) {
      this.i_f_extension.expect(
        currentExtension.toLowerCase(),
        "File: To lower case"
      );
    }

    if (
      this.i_f_qualif.expected &&
      this.i_f_title.expected == this.i_f_qualif.expected
    ) {
      // 'remove duplicate title/original'
      this.i_f_qualif.expect("", "Original is a duplicate of the title");
    }
  }

  getParentValue(): Value<FileFolder> {
    if (this.isTop()) {
      throw new Error("Could not getParentValue on top");
    }
    return this.i_parent as unknown as Value<FileFolder>;
  }

  get currentFilepath(): string {
    return this.i_f_path_full.current;
  }

  // ------------------------------------------
  //
  // Private methods
  //
  // ------------------------------------------

  /**
   * @override
   */
  modifiedValuesKeys() {
    if (!this.i_00_f_exists.current) {
      // The file does not exists anyway
      return ["i_00_f_exists"];
    }

    return super.modifiedValuesKeys();
  }

  printDetails(opts: OptionsPrint = {}) {
    const keyList = new Set([
      ...(opts.includes ?? []),
      ...this.unsolvedValuesKeys()
    ]);

    if (opts.includesActions) {
      this.modifiedValuesKeys().forEach((k) => keyList.add(k));
    }

    if (opts.includesInfos) {
      this.getAllValuesKeys().forEach((k) => keyList.add(k));
    }

    const infosToDisplay = Array.from(keyList)
      .filter((k) => k in this)
      .filter(
        (k) =>
          !opts.excludes ||
          !opts.excludes.includes(k) ||
          !this.getValueByKey(k).isDone()
      )
      .filter(
        (k) =>
          opts.includesCalculated ||
          !this.getValueByKey(k).isCalculated() ||
          !this.getValueByKey(k).isDone()
      )
      .sort()
      .map(
        (k: string) => "  * " + k + ":\n" + this.getValueByKey(k).toString(true)
      );

    if (infosToDisplay.length > 0) {
      writeLine(
        path.relative(process.cwd(), chalk.yellow(this.i_f_path_full.initial))
      );
      writeLine(infosToDisplay.join(""));
    }

    return this;
  }

  getMTime(): GenericTime {
    // While MTime is in UTC/GMT
    //   the getHours etc... give the time in the local timezone
    //   which is correct
    // Check: ls -l == getMTime()
    return GenericTime.fromDate(this.stats.mtime);
  }
}
