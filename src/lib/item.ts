import { FOError } from "../helpers/exceptions";
import { DUMP_IDENTATION } from "./constants";
import Value, { AbstractValue } from "./value";

/**
 * Counter of items
 *   To keep an unique id by item
 *
 * Must be > 0 everytime!!! (0 = no id)
 *
 * @see getEntityId()
 * @type {number}
 */
let id = 0;

export default class Item {
  // https://www.typescriptlang.org/docs/handbook/2/classes.html#index-signatures
  // [s: string]: any;

  /**
   * If the file is given by arguments
   * and thus the top of a hierarchy
   */
  #id: string;
  #title: string;
  i_parent: Value<Item | undefined>;

  /**
   *
   * @param {string} title of the item
   * @param {Item} parent of the item
   */
  constructor(title: string, parent?: Item) {
    this.#id = "" + id++;
    this.#title = title;
    this.i_parent = new Value(parent);
  }

  // ------------------------------------------
  //
  // Public properties
  //
  // ------------------------------------------

  get type(): string {
    return this.constructor.name;
  }

  get id(): string {
    return this.#id;
  }

  get title(): string {
    return this.#title;
  }

  isTop(): boolean {
    return !this.i_parent.current;
  }

  dump(msg: string = `${this.type} dump (${this.title})`): void {
    console.warn(msg, JSON.stringify(this, null, DUMP_IDENTATION));
  }

  getValueByKey<T>(key: string): Value<T> {
    return (this as Record<string, unknown>)[key] as Value<T>;
  }

  getAllValues(): Map<string, AbstractValue> {
    const vals = new Map<string, AbstractValue>();

    Object.keys(this)
      .sort((a, b) =>
        new Intl.Collator(undefined, {
          numeric: true,
          sensitivity: "base"
        }).compare(a, b)
      )
      // Yes, getValueByKey could send back something else than value...
      .filter((v) => this.getValueByKey(v) instanceof Value)
      .forEach((v) => vals.set(v, this.getValueByKey(v)));

    return vals;
  }

  getAllValuesKeys(): string[] {
    return Array.from(this.getAllValues().keys());
  }

  revertAll(): this {
    for (const [, v] of this.getAllValues()) {
      // [k, v]
      v.revert();
    }

    return this;
  }

  async runAllFixes(): Promise<this> {
    //
    // This should NOT be parallized:
    //    - it all modifies the file
    //    - or it is synchronous
    //
    for (const k of this.unsolvedValuesKeys()) {
      await this.getValueByKey(k).runFixValue();
    }
    return this;
  }

  isFixed(ignore: string[] = []): boolean {
    return this.unsolvedValuesKeys(ignore).length == 0;
  }

  assertIsFixed(): void {
    const unsolvedValues = this.unsolvedValuesKeys();
    if (unsolvedValues.length > 0) {
      throw new FOError(
        "Information not solved: " +
          unsolvedValues
            .map(
              (k) =>
                k +
                `(∃: ${JSON.stringify(
                  this.getValueByKey(k).current
                )} vs. <: ${JSON.stringify(this.getValueByKey(k).expected)})`
            )
            .join(", ")
      );
    }
  }

  unsolvedValuesKeys(ignore: string[] = []): string[] {
    return Array.from(this.getAllValues()) // [ key, value ]
      .filter(([k, _v]) => !ignore.includes(k))
      .filter(([_k, v]) => !v.isDone())
      .map(([k, _]) => k);
  }

  modifiedValuesKeys(): string[] {
    return Array.from(this.getAllValues().entries())
      .filter(([_k, v]) => v.isModified())
      .map(([k, _]) => k);
  }

  // ------------------------------------------
  //
  // Public methods
  //
  // ------------------------------------------
  toJSON() {
    const sortedValues = Array.from(this.getAllValues().entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ [k]: v }))
      .reduce((acc, v) => ({ ...acc, ...v }), {});

    return {
      id: this.id,
      type: this.type,
      isTop: this.isTop(),
      title: this.title,
      parentId: this.isTop() ? undefined : this.i_parent.expected!.id, // Item has optional parent
      values: sortedValues
    };
  }
}

export const NullItem = new Item("/");
