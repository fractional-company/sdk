interface FactoryItem {
  abi: any;
  contractAddress: string;
  block: number;
  vault: {
    fractionSchema: string;
    abi: any;
  };
}

interface BasketFactoryItem {
  abi: any;
  contractAddress: string;
  blockNumber: number;
  basket: {
    abi: any;
  };
}

declare module '@fractional-company/common' {
  export const TYPE_VAULT_FACTORY: string;
  export const SCHEMA_ERC1155: string;
  export const SCHEMA_ERC20: string;
  export const SCHEMA_ERC721: string;
  export const CHAINS: {
    [key: string]: number | string;
  };
  export const CHAIN_NAMES: {
    [key: string]: string;
  };
  export function getFactoryContractsMappedForChain(chainId: string | number): {
    [TYPE_VAULT_FACTORY: string]: FactoryItem[];
  };
  export function getVaultItem(chainId: string | number, address: string): FactoryItem;
  export function getLatestVaultItem(
    chainId: string | number,
    fractionSchema: string | undefined
  ): FactoryItem;
  export function getBasketItem(
    chainId: string | number,
    contractAddress: string
  ): BasketFactoryItem;
  export function getLatestBasketItem(chainId: string | number): BasketFactoryItem;
}
