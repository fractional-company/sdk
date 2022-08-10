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

export class Migration {
  public address: string;
  private migration: Contract;
  private isReadOnly: boolean;
  private signerOrProvider: Signer | Provider;

  constructor({ signerOrProvider, chainId = Chains.Mainnet }: Arguments) {
    if (!isValidChain(chainId)) throw new Error('Invalid chain ID');
    const ABI = Contracts.Migration.ABI;
    const address = Contracts.Migration.address[chainId];

    this.address = address;
    this.migration = new Contract(address, ABI, signerOrProvider);
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public getLeafNodes(): Promise<string[]> {
    return this.migration.getLeafNodes();
  }

  // Private methods
  #verifyIsNotReadOnly(): void {
    if (this.isReadOnly) throw new Error('Method requires a signer');
  }
}
