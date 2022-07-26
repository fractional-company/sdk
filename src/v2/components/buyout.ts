/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Signer, Contract } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { TransactionReceipt } from '@ethersproject/providers';
import { isAddress, parseEther } from 'ethers/lib/utils';
import { isValidChain, isNonNegativeEther, executeTransaction } from '../utils';
import { BuyoutInfo, Permission } from '../types/types';
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

  public async buyoutInfo(vaultAddress: string): Promise<BuyoutInfo> {
    if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);
    const info: BuyoutInfo = await this.buyout.functions.buyoutInfo(vaultAddress);

    return {
      ethBalance: info.ethBalance,
      fractionPrice: info.fractionPrice,
      lastTotalSupply: info.lastTotalSupply,
      proposer: info.proposer,
      startTime: info.startTime,
      state: info.state
    };
  }

  public async getLeafNodes(): Promise<string[]> {
    return this.buyout.functions.getLeafNodes();
  }

  public async getPermissions(): Promise<Permission[]> {
    const response: [Permission[]] = await this.buyout.functions.getPermissions();
    return response[0].map((permission) => ({
      module: permission.module,
      target: permission.target,
      selector: permission.selector
    }));
  }

  public async start(vaultAddress: string, amount: string): Promise<TransactionReceipt> {
    this.#verifyIsNotReadOnly();

    if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');
    if (!isNonNegativeEther(amount))
      throw new Error(`Amount must be greater than or equal to zero`);

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.buyout,
      method: 'start',
      args: [vaultAddress],
      options: {
        value: parseEther(amount)
      }
    });
  }

  // Private methods
  #verifyIsNotReadOnly(): void {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
