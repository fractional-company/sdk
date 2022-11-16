import { getFactoryContractsMappedForChain, TYPE_VAULT_FACTORY } from '@fractional-company/common';

export function isValidChain(chainId: number | string): boolean {
  // Determines if chain id is valid and supported
  if (typeof chainId !== 'number' && typeof chainId !== 'string') return false;
  if (typeof chainId === 'string') {
    chainId = parseInt(chainId);
  }
  return !!getFactoryContractsMappedForChain(chainId)[TYPE_VAULT_FACTORY];
}
