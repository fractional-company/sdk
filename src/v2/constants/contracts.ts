import { Chain } from './chains';
import { ArtEnjoyerProtoform, CHAINS } from '@fractional-company/common';

export enum Contract {
  FERC1155 = 'FERC1155',
  LPDA = 'LPDA',
  OptimisticBid = 'OPTIMISTIC_BID',
  VaultRegistry = 'VAULT_REGISTRY',
  Multicall = 'MULTICALL'
}

const { Mainnet, Goerli } = Chain;
const { FERC1155, LPDA, OptimisticBid, VaultRegistry, Multicall } = Contract;

export const ContractAddresses: {
  [chainId in Chain]: {
    [contract in Contract]: string;
  };
} = {
  [Mainnet]: {
    [FERC1155]: ArtEnjoyerProtoform.getFERC(CHAINS.MAINNET)!.contractAddress,
    [LPDA]: ArtEnjoyerProtoform.getLPDAModule(CHAINS.MAINNET)!.contractAddress,
    [OptimisticBid]: ArtEnjoyerProtoform.getOptimisticBidModule(CHAINS.MAINNET)!.contractAddress,
    [VaultRegistry]: ArtEnjoyerProtoform.getVaultRegistry(CHAINS.MAINNET)!.contractAddress,
    [Multicall]: '0xcA11bde05977b3631167028862bE2a173976CA11'
  },
  [Goerli]: {
    [FERC1155]: ArtEnjoyerProtoform.getFERC(CHAINS.GÖRLI)!.contractAddress,
    [LPDA]: ArtEnjoyerProtoform.getLPDAModule(CHAINS.GÖRLI)!.contractAddress,
    [OptimisticBid]: ArtEnjoyerProtoform.getOptimisticBidModule(CHAINS.GÖRLI)!.contractAddress,
    [VaultRegistry]: ArtEnjoyerProtoform.getVaultRegistry(CHAINS.GÖRLI)!.contractAddress,
    [Multicall]: '0xcA11bde05977b3631167028862bE2a173976CA11'
  }
};
