import { Chains } from '../common/constants';

export function isValidChain(chainId: number): boolean {
  return [Chains.Mainnet, Chains.Rinkeby].includes(chainId);
}
