import { Chains } from '../common/constants';

export function isValidChain(chainId: number): boolean {
  return chainId === Chains.Mainnet || chainId === Chains.Rinkeby;
}
