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
    [FERC1155]: '0xdd2780489BE5581892b59d6e7D3104Bc51B69fF2',
    [LPDA]: '0x40F865615103F17CC885D9745EC9527ea5a1cFaB',
    [OptimisticBid]: '0xfc4Ab7e0f820603799Fd59C87b235D8B7C54fC64',
    [VaultRegistry]: '0x7FE0F93695FDC9fF438df3e580f3c0B1389d10cD',
    [Multicall]: '0xcA11bde05977b3631167028862bE2a173976CA11'
  }
};
