/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Signer, Contract, BigNumberish, BigNumber } from 'ethers';
import { TransactionReceipt } from '@ethersproject/providers';
import { Provider } from '@ethersproject/abstract-provider';
import { isAddress } from 'ethers/lib/utils';
import { isValidChain, isValidAmount, executeTransaction } from '../utils';
import { Chains, Contracts } from '../common';

interface FERC1155Config {
  signerOrProvider: Signer | Provider;
  chainId?: number;
}

export class FERC1155 {
  public address: string;
  private isReadOnly: boolean;
  private ferc1155: Contract;
  private signerOrProvider: Signer | Provider;

  constructor({ signerOrProvider, chainId = Chains.Mainnet }: FERC1155Config) {
    if (!isValidChain(chainId)) throw new Error('Invalid chain ID');
    const ABI = Contracts.FERC1155.ABI;
    const address = Contracts.FERC1155.address[chainId];

    this.address = address;
    this.ferc1155 = new Contract(address, ABI, signerOrProvider);
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public async balanceOf(owner: string, id: BigNumberish): Promise<BigNumber> {
    if (!isAddress(owner)) throw new Error('Owner address is not valid');
    if (!isValidAmount(id)) throw new Error('Token ID is not valid');

    const [balance] = await this.ferc1155.functions.balanceOf(owner, id);
    return balance;
  }

  public async totalSupply(id: BigNumberish): Promise<BigNumber> {
    if (!isValidAmount(id)) throw new Error('Token ID is not valid');

    const [totalSupply] = await this.ferc1155.functions.totalSupply(id);
    return totalSupply;
  }

  public async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    if (!isAddress(owner)) throw new Error('Owner address is not valid');
    if (!isAddress(operator)) throw new Error('Operator address is not valid');

    const [isApproved] = await this.ferc1155.functions.isApprovedForAll(owner, operator);
    return isApproved;
  }

  public async safeTransferFrom(
    from: string,
    to: string,
    id: BigNumberish,
    amount: BigNumberish,
    data = '0x'
  ): Promise<TransactionReceipt> {
    this.#verifyIsNotReadOnly();

    if (!isAddress(from)) throw new Error('From address is not valid');
    if (!isAddress(to)) throw new Error('To address is not valid');
    if (!isValidAmount(amount)) throw new Error('Transfer amount is not valid');
    if (!isValidAmount(id)) throw new Error('Token ID is not valid');

    return executeTransaction({
      contract: this.ferc1155,
      method: 'safeTransferFrom',
      args: [from, to, id, amount, data],
      signerOrProvider: this.signerOrProvider
    });
  }

  public async setApprovalForAll(operator: string, approved: boolean): Promise<TransactionReceipt> {
    this.#verifyIsNotReadOnly();

    if (!isAddress(operator)) throw new Error('Operator address is not valid');
    if (typeof approved !== 'boolean') throw new Error('Approved must be a boolean');

    return executeTransaction({
      contract: this.ferc1155,
      method: 'setApprovalForAll',
      args: [operator, approved],
      signerOrProvider: this.signerOrProvider
    });
  }

  // Private methods
  #verifyIsNotReadOnly(): void {
    if (this.isReadOnly) throw new Error('Method requires a signer');
  }
}
