import chalk from "chalk";
import EventEmitter from "eventemitter3";
import { IconSuccess } from "../helpers/tui-helpers";
import { Equalable } from "./equalable";

// This function must ".fix()" the value
export type FixFunction<T> = (val: Value<T>) => Promise<void> | void;
export type ValueCalculation<T> = () => T;
export type CanonizeFunction<T> = (val: T) => T;

export enum Flavor {
  initial = "initial",
  current = "current",
  expected = "expected"
}

export class AbstractValue extends EventEmitter {
  fixed() {
    return this;
  }

  revert() {
    return this;
  }

  isDone(): boolean {
    return true;
  }

  isModified(): boolean {
    return true;
  }

  onExpectedChanged(_cb: () => void, _fireImmediately: boolean = false): this {
    return this;
  }
}

/**
 * A value
 */
export default class Value<T> extends AbstractValue {
  #initial: T;

  #current: T;

  #currentFunction?: ValueCalculation<T>;

  #expected: T;

  #expectedFunction?: ValueCalculation<T>;

  #expectedFrozen: boolean = false;

  #fixFunction: FixFunction<T> = async (_v: Value<T>) => {};

  #canonizeFunction: CanonizeFunction<T> = (v: T) => v;

  #fixAlso: Array<AbstractValue> = [];

  #lastEmittedExpected: T;

  lastError?: Error;

  /**
   * List of associated messages
   */
  messages: string[] = [];

  /**
   *
   * @param {*} [value] as the initial value (could be initialized by withCurrentCalculated)
   */
  constructor(value: T) {
    super();
    this.#initial = value;
    this.#current = value;
    this.#expected = value;

    // Per default, this initial value is considered "fired"
    this.#lastEmittedExpected = value;
  }

  get initial() {
    return this.#initial;
  }

  get expected() {
    if (this.#expectedFunction) {
      return this.#expectedFunction();
    }
    return this.#expected;
  }

  get current() {
    if (this.#currentFunction) {
      return this.#currentFunction();
    }
    return this.#current;
  }

  isCalculated() {
    return (
      this.#expectedFrozen || this.#expectedFunction || this.#currentFunction
    );
  }

  withCanonize(fn: CanonizeFunction<T>) {
    this.#canonizeFunction = fn;
    // If the expected value was already set, we need to canonize it...
    this.#expected = this.#canonizeFunction(this.#expected);
    return this;
  }

  withExpectedFrozen(expected: T, message = "") {
    this.expect(expected, message);
    this.#expectedFrozen = true;
    return this;
  }

  /**
   *
   * @param {ValueCalculation} fn to calculate the expected value
   * @param {Array<Value>} basedOn to listen for
   * @returns {this} for chaining
   */
  withExpectedCalculated(
    fn: ValueCalculation<T>,
    basedOn: AbstractValue[] = []
  ) {
    const prevExpected = this.expected;

    this.#expectedFunction = fn;
    for (const val of basedOn) {
      val.onExpectedChanged(() => this.emitExpectedChange());
    }

    // The calculated (new) value is different thant previous one?
    if (this.expected != prevExpected) {
      this.emitExpectedChange();
    }

    return this;
  }

  /**
   * The current value is calculated based on a formula.
   *    - the initial value is calculated also
   *    - if the expected value is not already set, it is initialized
   *
   * @param {ValueCalculation} fn to calculate the current value
   * @returns {this} for chaining
   */
  withCurrentCalculated(fn: ValueCalculation<T>) {
    this.#currentFunction = fn;
    this.#initial = fn();
    if (this.#expected === undefined) {
      this.#expected = fn();
    }
    return this;
  }

  withFix(fixFunction: FixFunction<T>, fixAlso: AbstractValue[] = []) {
    this.#fixFunction = fixFunction;
    this.#fixAlso = fixAlso;
    return this;
  }

  isModified(): boolean {
    return !this.equals(this.current, this.initial);
  }

  isDone(): boolean {
    return this.equals(this.expected, this.current);
  }

  equals(a: T, b: T): boolean {
    if (a instanceof Equalable && b instanceof Equalable) {
      return a.equals(b) as boolean;
    }

    return a == b;
  }

  revert(): this {
    if (!this.#expectedFrozen && !this.#expectedFunction) {
      this.expect(this.current);
    }
    return this;
  }

  fixed(): this {
    if (!this.#currentFunction) {
      this.#current = this.expected;
    }

    // Dependant values are also automatically fixed
    for (const val of this.#fixAlso) {
      val.fixed();
    }

    return this;
  }

  /**
   * Fix the current value by executing fixing function
   * - If the function is alreay "done", does nothing...
   * - In case of error, store the error in #lastError
   *
   * We don't fix the value here, since we don't know if it worked or not
   *
   */
  async runFixValue(): Promise<void> {
    if (this.isDone()) {
      return;
    }

    try {
      await this.#fixFunction(this);
    } catch (e) {
      this.lastError = e as Error;
      throw e;
    }
  }

  /**
   * Set the expected value
   */
  expect(expect: T, message?: string) {
    if (this.#expectedFrozen) {
      throw new Error(
        `Expected value is frozen to ${JSON.stringify(this.#expected)}. Could not expect anymore to ${JSON.stringify(expect)} (${message})`
      );
    }

    expect = this.#canonizeFunction(expect);

    if (this.equals(this.#expected, expect)) {
      return this;
    }
    if (message) {
      this.messages.push(message);
    }

    // Emit only if a change is present there
    if (this.#expected !== expect) {
      this.#expected = expect;
      this.emitExpectedChange();
    }
    return this;
  }

  /**
   * Emit a signal that the expected value has changed
   */
  protected emitExpectedChange() {
    const prev = this.#lastEmittedExpected;
    this.#lastEmittedExpected = this.expected;
    // new, old
    this.emit("expectedChanged", this.#lastEmittedExpected, prev);
    return this;
  }

  onExpectedChanged(cb: () => void, fireImmediately: boolean = false): this {
    this.on("expectedChanged", (_new: T, _old: T) => {
      cb();
    });
    if (fireImmediately) {
      cb();
    }
    return this;
  }

  toJSON() {
    const vjson = (val: T) =>
      val && typeof val == "object" && "id" in val ? val.id : val;

    return {
      className: this.constructor.name,
      initial: vjson(this.initial),
      current: vjson(this.current),
      expected: vjson(this.expected),
      messages: this.messages,
      lastError: this.lastError
    };
  }

  toString(pretty: boolean = false, padding: number = 10) {
    const newline = (nonpretty: string = " ") =>
      pretty ? "\n" + " ".repeat(padding) : nonpretty;

    return (
      "" +
      // Header
      (pretty ? " ".repeat(padding) : "") +
      // expected == current -> icone
      ("← " + this.initial) +
      // current == initial
      (this.isModified()
        ? newline() +
          ((this.isDone() ? IconSuccess : "=") + " ") +
          chalk.yellow(this.#current)
        : "") +
      // expected == current -> value
      (this.isDone() ? "" : newline() + chalk.red("→ " + this.#expected)) +
      // messages
      (this.messages.length > 0
        ? pretty
          ? this.messages
              .map((v) => newline() + "  - " + chalk.yellow(v))
              .join("")
          : " [" + this.messages.map((s) => chalk.yellow(s)).join(",") + "]"
        : "") +
      // prepare for next line
      (pretty ? "\n" : "")
    );
  }
}

export function currentCalculatedValueFactory(
  explanation: string,
  calculation: ValueCalculation<boolean>
): Value<boolean> {
  return new Value<boolean>(calculation())
    .withCurrentCalculated(calculation)
    .withExpectedFrozen(true, explanation);
}
