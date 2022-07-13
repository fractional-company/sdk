/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Signer, Contract } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { isValidChain } from '../utils';
import { Chains, Contracts } from '../common';

interface Arguments {
  signerOrProvider: Signer | Provider;
  chainId?: number;
}

export class Buyout {
  public address: string;
  private buyout: Contract;
  private isReadOnly: boolean;
  private signerOrProvider: Signer | Provider;

  constructor({ signerOrProvider, chainId = Chains.Mainnet }: Arguments) {
    if (!isValidChain(chainId)) throw new Error('Invalid chain ID');
    const ABI = Contracts.Buyout.ABI;
    const address = Contracts.Buyout.address[chainId];

    this.address = address;
    this.buyout = new Contract(address, ABI, signerOrProvider);
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public getLeafNodes(): Promise<string[]> {
    return this.buyout.getLeafNodes();
  }

  // Private methods
  private verifyIsNotReadOnly(): void {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
