import { Chain, Contract, ContractAddresses } from '../constants';

export function getContractAddress(contract: Contract, chainId: Chain): string {
  return ContractAddresses[chainId][contract];
}
