export function pad(number: number = 0, n: number = 2): string {
  return ("" + number).padStart(n, "0");
}

export function withFirstUpperCase(v: string): string {
  if (!v) {
    return v;
  }
  if (typeof v != "string") {
    return v;
  }
  return v.charAt(0).toUpperCase() + v.slice(1);
}
