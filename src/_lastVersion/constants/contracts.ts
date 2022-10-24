import { Chain } from './chains';

export enum Contract {
  LPDA = 'LPDA',
  OptimisticBid = 'OPTIMISTIC_BID',
  VaultRegistry = 'VAULT_REGISTRY'
}

const { Mainnet, Goerli } = Chain;
const { LPDA, OptimisticBid, VaultRegistry } = Contract;

export const ContractAddresses: {
  [chainId in Chain]: {
    [contract in Contract]: string;
  };
} = {
  [Mainnet]: {
    [LPDA]: '0x0000000000000000000000000000000000000000',
    [OptimisticBid]: '0x0000000000000000000000000000000000000000',
    [VaultRegistry]: '0x0000000000000000000000000000000000000000'
  },
  [Goerli]: {
    [LPDA]: '0xC2A1d152f8F539E2E40AC5AB2d23608efc2cb2DC',
    [OptimisticBid]: '0x9a6D7543B0eddE7031Db072fbfC28416531993F7',
    [VaultRegistry]: '0x69a6C6876b18A0CDf48DE09E4EC71B3e08277d6b'
  }
};
