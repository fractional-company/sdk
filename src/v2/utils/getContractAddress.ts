import { Chain, Contract } from '../constants';
import { ArtEnjoyerProtoform } from '@fractional-company/common';

export function getContractAddress(contract: Contract, chainId: Chain, modules?: string[]): string {
  const protoform = ArtEnjoyerProtoform.getProtoform(chainId, modules);
  if (!protoform) throw new Error('Invalid chain ID or modules');
  const contracts = {
    [Contract.FERC1155]: protoform?.ferc.contractAddress,
    [Contract.LPDA]: protoform?.modules.lpda.contractAddress,
    [Contract.OptimisticBid]: protoform?.modules.optimisticBid.contractAddress,
    [Contract.VaultRegistry]: protoform?.factories.vaultRegistry.contractAddress,
    [Contract.Multicall]: '0xcA11bde05977b3631167028862bE2a173976CA11'
  };
  return contracts[contract];
}
