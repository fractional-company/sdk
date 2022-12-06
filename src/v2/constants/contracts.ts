import { Chain } from './chains';
import { ART_ENJOYER_PROTOFORM, CHAINS } from '@fractional-company/common';

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
    [FERC1155]: ART_ENJOYER_PROTOFORM.ferc[CHAINS.MAINNET].contractAddress,
    [LPDA]: ART_ENJOYER_PROTOFORM.modules.lpda[CHAINS.MAINNET].contractAddress,
    [OptimisticBid]: ART_ENJOYER_PROTOFORM.modules.optimisticBid[CHAINS.MAINNET].contractAddress,
    [VaultRegistry]: ART_ENJOYER_PROTOFORM.factories.vaultRegistry[CHAINS.MAINNET].contractAddress,
    [Multicall]: '0xcA11bde05977b3631167028862bE2a173976CA11'
  },
  [Goerli]: {
    [FERC1155]: ART_ENJOYER_PROTOFORM.ferc[CHAINS.GÖRLI].contractAddress,
    [LPDA]: ART_ENJOYER_PROTOFORM.modules.lpda[CHAINS.GÖRLI].contractAddress,
    [OptimisticBid]: ART_ENJOYER_PROTOFORM.modules.optimisticBid[CHAINS.GÖRLI].contractAddress,
    [VaultRegistry]: ART_ENJOYER_PROTOFORM.factories.vaultRegistry[CHAINS.GÖRLI].contractAddress,
    [Multicall]: '0xcA11bde05977b3631167028862bE2a173976CA11'
  }
};
