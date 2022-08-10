import { BigNumberish, Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { Chains, Variants } from '../constants';

export type Connection = Signer | Provider;

export interface Options {
  chainId: Chains;
  variant: Variants;
}

export interface ContractOverrides {
  nonce?: BigNumberish;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  value?: BigNumberish;
}

export interface ContractConstant {
  [key: string]: {
    [key: string]: {
      address: {
        [key: number]: string;
      };
      ABI: any[];
    };
  };
}

export interface Token {
  standard: string;
  address: string;
  id?: BigNumberish;
  amount?: string;
  data?: string[];
}

export type Proof = string[][];

export enum AuctionState {
  inactive = 0,
  live = 1,
  success = 2
}
