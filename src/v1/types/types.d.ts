import { Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';

// Vault
export interface VaultConfig {
  signerOrProvider: Signer | Provider;
  chainId: number | string;
  address: string;
  factoryAddress: string;
}

export interface VaultData {
  token: string;
  id: BigNumberish;
  amount: BigNumberish;
  listPrice?: BigNumberish;
  fee?: BigNumberish;
  name?: string;
  symbol?: string;
}

export interface VaultMintResponse {
  vaultAddress: string;
}

// Vault Factory
export interface FactoryConfig {
  signerOrProvider: Signer | Provider;
  chainId: number | string;
  address?: string;
  fractionSchema?: string;
}

export interface FactoryItem {
  abi: any;
  contractAddress: string;
  block: number;
  vault: {
    fractionSchema: string;
    abi: any;
  };
}

// Basket Factory
export interface BasketFactoryConfig {
  signerOrProvider: Signer | Provider;
  chainId: number | string;
  address?: string;
}

export interface BasketFactoryItem {
  abi: any;
  contractAddress: string;
  blockNumber: number;
  basket: {
    abi: any;
  };
}

// Basket
export interface Basket {
  address: string;
  tokenId: BigNumberish;
}

// ERC721
export interface ERC721Config {
  address: string;
  signerOrProvider: Signer | Provider;
  chainId: number | string;
}

// Contract
export interface ContractOverrides {
  nonce?: BigNumberish;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  value?: BigNumberish;
}
