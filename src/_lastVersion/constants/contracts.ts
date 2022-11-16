import { Chain } from './chains';

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
    [FERC1155]: '0x0000000000000000000000000000000000000000',
    [LPDA]: '0x0000000000000000000000000000000000000000',
    [OptimisticBid]: '0x0000000000000000000000000000000000000000',
    [VaultRegistry]: '0x0000000000000000000000000000000000000000',
    [Multicall]: '0xcA11bde05977b3631167028862bE2a173976CA11'
  },
  [Goerli]: {
    [FERC1155]: '0x677984fd204AA15531Fe748aC7Ba14D659bec179',
    [LPDA]: '0xAa4C9674097Cd9eC35c28Bf4715259f56334b2be',
    [OptimisticBid]: '0xbA02B214a6780393d068929a8b82B72781e4b3b9',
    [VaultRegistry]: '0x84506Be5Bb7486b035424Fbf8417Fcc2C8C384Ba',
    [Multicall]: '0xcA11bde05977b3631167028862bE2a173976CA11'
  }
};
