export abstract class Equalable {
  abstract equals(t: Equalable): boolean;
  abstract toString(): string;
}

export function isEqual(a?: unknown, b?: unknown) {
  if (a === b) {
    return true;
  }

  if (a === undefined || b === undefined || a === null || b === null) {
    return false;
  }

  if (a instanceof Equalable && b instanceof Equalable) {
    return a.equals(b);
  } else if (a instanceof Equalable) {
    if (typeof b == "string") {
      return a.toString() == b;
    }
    return false;
  } else {
    if (b instanceof Equalable) {
      if (typeof a == "string") {
        return a == b.toString();
      }
      return false;
    }
  }

  return a === b;
}
