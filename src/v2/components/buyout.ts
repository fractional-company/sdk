/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Signer, Contract } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { isValidChain } from '../utils';
import { CHAINS, CONTRACTS } from '../common';

interface Arguments {
  signerOrProvider: Signer | Provider;
  chainId?: number;
}

export class Buyout {
  public address: string;
  private buyout: Contract;
  private isReadOnly: boolean;
  private signerOrProvider: Signer | Provider;

  constructor({ signerOrProvider, chainId = CHAINS.MAINNET }: Arguments) {
    if (!isValidChain(chainId)) throw new Error('Invalid chain ID');
    const { abi, address } = CONTRACTS[chainId].BUYOUT;
    this.address = address;
    this.buyout = new Contract(address, abi, signerOrProvider);
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public getLeafNodes(): Promise<string[]> {
    return this.buyout.getLeafNodes();
  }

  // Private methods
  private verifyIsNotReadOnly() {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
