import { TransactionResponse } from '@ethersproject/providers';
import { BigNumberish, Signer } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { Chain, Contract } from '../constants';
import { FERC1155 as FERC1155Interface, FERC1155__factory as FERC1155Factory } from '../contracts';
import { Connection } from '../types/types';
import {
  executeTransaction,
  formatError,
  getContractAddress,
  isValidAmount,
  isValidChain,
  isValidTokenId
} from '../utils';

export class FERC1155 {
  public chainId: Chain;
  public address: string;
  public isReadOnly: boolean;
  public connection: Connection;
  public contract: FERC1155Interface;

  constructor(connection: Connection, chainId: Chain) {
    if (!isValidChain(chainId)) throw new Error('Invalid chain ID');

    this.chainId = chainId;
    this.connection = connection;
    this.isReadOnly = !Signer.isSigner(this.connection);

    this.address = getContractAddress(Contract.FERC1155, this.chainId);
    this.contract = FERC1155Factory.connect(this.address, this.connection);
  }

  // ======== Read Methods ========

  public async balanceOf(owner: string, tokenId: BigNumberish): Promise<string> {
    if (!isAddress(owner)) {
      throw new Error('Invalid owner address');
    }

    if (!isValidTokenId(tokenId)) {
      throw new Error('Invalid token ID');
    }

    try {
      const balance = await this.contract.balanceOf(owner, tokenId);
      return balance.toString();
    } catch (e) {
      throw new Error(formatError(e));
    }
  }

  public async isApproved(
    owner: string,
    operator: string,
    tokenId: BigNumberish
  ): Promise<boolean> {
    if (!isAddress(owner)) {
      throw new Error('Invalid owner address');
    }

    if (!isAddress(operator)) {
      throw new Error('Invalid operator address');
    }

    if (!isValidTokenId(tokenId)) {
      throw new Error('Invalid token ID');
    }

    try {
      return await this.contract.isApproved(owner, operator, tokenId);
    } catch (e) {
      throw new Error(formatError(e));
    }
  }

  public async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    if (!isAddress(owner)) {
      throw new Error('Invalid owner address');
    }

    if (!isAddress(operator)) {
      throw new Error('Invalid operator address');
    }

    try {
      return await this.contract.isApprovedForAll(owner, operator);
    } catch (e) {
      throw new Error(formatError(e));
    }
  }

  public async totalSupply(tokenId: BigNumberish): Promise<string> {
    if (!isValidTokenId(tokenId)) {
      throw new Error('Invalid token ID');
    }

    try {
      const totalSupply = await this.contract.totalSupply(tokenId);
      return totalSupply.toString();
    } catch (e) {
      throw new Error(formatError(e));
    }
  }

  // ======== Write Methods ========

  public async safeTransferFrom(
    from: string,
    to: string,
    id: BigNumberish,
    amount: BigNumberish,
    data?: string
  ): Promise<TransactionResponse> {
    if (!isAddress(from)) {
      throw new Error('Invalid from address');
    }

    if (!isAddress(to)) {
      throw new Error('Invalid to address');
    }

    if (!isValidTokenId(id)) {
      throw new Error('Invalid token ID');
    }

    if (!isValidAmount(amount)) {
      throw new Error('Invalid amount');
    }

    if (data && typeof data !== 'string') {
      throw new Error('Invalid data');
    }

    const transactionData = data || '0x';

    try {
      return await executeTransaction({
        connection: this.connection,
        contract: this.contract,
        method: 'safeTransferFrom',
        args: [from, to, id, amount, transactionData]
      });
    } catch (e) {
      throw new Error(formatError(e));
    }
  }

  public async safeBatchTransferFrom(
    from: string,
    to: string,
    ids: BigNumberish[],
    amounts: BigNumberish[],
    data?: string
  ): Promise<TransactionResponse> {
    if (!isAddress(from)) {
      throw new Error('Invalid from address');
    }

    if (!isAddress(to)) {
      throw new Error('Invalid to address');
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Invalid token IDs');
    }

    if (!Array.isArray(amounts) || amounts.length === 0) {
      throw new Error('Invalid amounts');
    }

    if (ids.length !== amounts.length) {
      throw new Error('IDs and amounts must be the same length');
    }

    if (data && typeof data !== 'string') {
      throw new Error('Invalid data');
    }

    const transactionData = data || '0x';

    try {
      return await executeTransaction({
        connection: this.connection,
        contract: this.contract,
        method: 'safeBatchTransferFrom',
        args: [from, to, ids, amounts, transactionData]
      });
    } catch (e) {
      throw new Error(formatError(e));
    }
  }

  public async setApprovalFor(
    operator: string,
    tokenId: BigNumberish,
    approved: boolean
  ): Promise<TransactionResponse> {
    if (!isAddress(operator)) {
      throw new Error('Invalid operator address');
    }

    if (!isValidTokenId(tokenId)) {
      throw new Error('Invalid token ID');
    }

    if (typeof approved !== 'boolean') {
      throw new Error('Invalid approved value');
    }

    try {
      return await executeTransaction({
        connection: this.connection,
        contract: this.contract,
        method: 'setApprovalFor',
        args: [operator, tokenId, approved]
      });
    } catch (e) {
      throw new Error(formatError(e));
    }
  }

  public async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<TransactionResponse> {
    if (!isAddress(operator)) {
      throw new Error('Invalid operator address');
    }

    if (typeof approved !== 'boolean') {
      throw new Error('Approval status must be a boolean');
    }

    try {
      return await executeTransaction({
        connection: this.connection,
        contract: this.contract,
        method: 'setApprovalForAll',
        args: [operator, approved]
      });
    } catch (e) {
      throw new Error(formatError(e));
    }
  }
}
