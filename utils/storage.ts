/** Privacy settings may deny storage; navigation and theme controls must still work. */
export function readStorage(kind: 'local' | 'session', key: string): string | null {
  try {
    return window[`${kind}Storage`].getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(kind: 'local' | 'session', key: string, value: string): void {
  try {
    window[`${kind}Storage`].setItem(key, value);
  } catch {
    /* Optional persistence. */
  }
}
