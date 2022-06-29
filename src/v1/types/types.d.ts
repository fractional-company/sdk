import { Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';

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
