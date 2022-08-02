import { Chains } from '../constants';

export function isValidChain(chainId: number): boolean {
  return [Chains.Mainnet, Chains.Rinkeby].includes(chainId);
}
