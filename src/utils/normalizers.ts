export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
