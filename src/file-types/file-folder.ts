import fs from "node:fs";
import path from "node:path";
import Item, { NullItem } from "../lib/item";
import { Flavor } from "../lib/value";
import File, { buildFilename } from "./file";

export default class FileFolder extends File {
  unmappedListing: Set<string> = new Set();
  listOfFiles: {
    [Flavor.current]: Map<string, File>;
    [Flavor.expected]: Map<string, File>;
  } = {
    current: new Map(),
    expected: new Map()
  };

  constructor(filename: string, parent: Item) {
    super(filename, parent);
    this.reset();
  }

  reset() {
    this.listOfFiles = {
      [Flavor.current]: new Map(),
      [Flavor.expected]: new Map()
    };

    this.unmappedListing = this.listContentAsStrings().reduce((set, val) => {
      {
        set.add(val);
        return set;
      }
    }, new Set<string>());
  }

  _addNewlyCreateFile(filename: string) {
    this.unmappedListing.add(filename);
  }

  listContentAsStrings(): string[] {
    return fs.readdirSync(this.i_f_path_full.initial, { encoding: "utf8" });
  }

  registerFile(file: File, filename: string, flavor: Flavor): this {
    if (flavor == Flavor.initial) {
      if (!this.unmappedListing.has(filename)) {
        this.throwError("Unknown file in unmappedListing", filename, flavor);
      }
      this.unmappedListing.delete(filename);

      // Initialize all flavors
      this.registerFile(file, filename, Flavor.current);
      this.registerFile(file, filename, Flavor.expected);
    } else {
      if (this.listOfFiles[flavor].has(filename)) {
        this.throwError("Overriding", filename, flavor);
      }
      this.listOfFiles[flavor].set(filename, file);
    }
    return this;
  }

  unregisterFile(
    _file: File,
    filename: string,
    flavor: Flavor.current | Flavor.expected
  ): this {
    if (!this.listOfFiles[flavor].has(filename)) {
      this.throwError("Unregistering non-existant", filename, flavor);
    }
    this.listOfFiles[flavor].delete(filename);
    return this;
  }

  /**
   * Calculate a free qualif by index
   */
  getAvailableIndexedQualif(file: File): string {
    // All the qualif of files with same name and time, except file itself
    const qualifAlreadyTaken = Array.from(
      this.listOfFiles[Flavor.expected].values()
    )
      .filter((f) => f != file)
      .filter((f) => f.i_f_title.expected == file.i_f_title.expected)
      .filter((f) => f.i_f_time.expected.equals(file.i_f_time.expected))
      .map((f) => f.i_f_qualif.expected);

    const isAvailable = (qualif: string) =>
      !qualifAlreadyTaken.includes(qualif) &&
      // Exclude unmapped files too
      !this.unmappedListing.has(
        buildFilename(
          file.i_f_time.expected,
          file.i_f_title.expected,
          qualif,
          file.i_f_extension.expected
        )
      );

    // We could take the currently expected qualif
    if (isAvailable(file.i_f_qualif.expected)) {
      return file.i_f_qualif.expected;
    }

    // If the 'empty' qualif is available, let's take it:
    if (isAvailable("")) {
      return "";
    }

    // Let's get the next available qualif around numeric one:
    let i = 1;
    while (!isAvailable("" + i)) {
      i++;
    }
    return "" + i;
  }

  throwError(message: string, filename: string, flavor: Flavor) {
    throw new Error(`[Reservations/${flavor}] ${message}: ${filename} in ${
      this.i_f_path_full.initial
    }
    ${this.getReservationsDump()}`);
  }

  getReservationsDump() {
    return `
    U[${Array.from(this.unmappedListing).join(",")}]
    C[${Array.from(this.listOfFiles.current.keys()).join(",")}]
    E[${Array.from(this.listOfFiles.expected.keys()).join(",")}]`;
  }
}

export class FileFolderTop extends FileFolder {
  constructor() {
    super("/", NullItem);
  }
}

const foldersCache: Map<string, FileFolder> = new Map();

export function getParentOf(filepath: string): FileFolder {
  return getFolderByName(path.dirname(path.resolve(filepath)));
}

export function getFolderByName(filepath: string): FileFolder {
  filepath = path.resolve(filepath);

  if (foldersCache.has(filepath)) {
    return foldersCache.get(filepath)!;
  }

  // Only place where we build FileFolder (except FileFolderTop below)
  const f = new FileFolder(path.basename(filepath), getParentOf(filepath));
  foldersCache.set(filepath, f);
  return f;
}

export function _resetFolderCache() {
  foldersCache.clear();
  foldersCache.set("/", new FileFolderTop());
}
_resetFolderCache();

function _dumpCache(): void {
  process.stdout.write("*** foldersCache cache ***\n");
  for (const k of foldersCache.keys()) {
    const file = foldersCache.get(k)!;
    // We can not import File here, that would create a cyclical reference @ imports
    // So we use constructor to access static constants
    process.stdout.write(
      `- ${k.padEnd(40)} #${("" + file.id).padEnd(
        2
      )} ${file.i_f_path_full.initial.padEnd(20)} (${
        "#" + (file.isTop() ? "<TOP>" : file.getParentValue().initial.id)
      }/)\n`
    );
  }
  process.stdout.write("--- foldersCache cache ---\n");
}

/**
 *
 * On debug, dump known files at the end
 *
 */
if (process.env.DEBUG) {
  process.on("exit", () => {
    _dumpCache();
  });
}
