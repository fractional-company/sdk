import { Provider } from '@ethersproject/abstract-provider';
import { BigNumberish, Signer } from 'ethers';

export type Connection = Signer | Provider;

export type Proof = string[][];

export type TokenId = string | number;

export interface TokenTransfer {
  id: TokenId;
  amount: BigNumberish;
}

export interface Token {
  standard: string;
  address: string;
  id?: TokenId;
  amount?: string;
  data?: string[];
}
