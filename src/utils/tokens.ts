/***
 *
 * @param address
 * @param symbol
 * @returns {string}
 */
export function formatTokenSymbol(address: string, symbol: string): string {
  if (!symbol) {
    throw Error('No symbol provided');
  }

  return symbol?.toUpperCase();
}

/**
 *
 * @param address
 * @param name
 * @returns {string}
 */
export function formatTokenName(address: string, name: string): string {
  return name;
}
