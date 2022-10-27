import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from 'ethers';

export type Connection = Signer | Provider;

export type Proof = string[][];

export interface GasData {
  gasLimit: string;
  gasPrice: string | null;
  maxFeePerGas: string | null;
  maxPriorityFeePerGas: string | null;
  totalGasFee: string | null;
}
