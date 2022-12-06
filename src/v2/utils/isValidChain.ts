import { Chain } from '../constants';

export function isValidChain(chainId: Chain): boolean {
  return Object.values(Chain).includes(chainId);
}
