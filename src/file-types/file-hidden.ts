import File from "./file";

export default class FileHidden extends File {
  /**
   * Nothing to be done on an Hidden File
   *
   * @override
   */
  runAllFixes(): Promise<this> {
    this.revertAll();
    return Promise.resolve(this);
  }
}
