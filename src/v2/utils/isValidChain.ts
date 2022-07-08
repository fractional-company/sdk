import { CHAINS } from '../common/constants';

export function isValidChain(chainId: number): boolean {
  return chainId === CHAINS.MAINNET || chainId === CHAINS.RINKEBY;
}
