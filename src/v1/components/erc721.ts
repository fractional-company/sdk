/* eslint-disable */
import { BytesLike, Contract, Signer } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';
import { isAddress } from '@ethersproject/address';
import { CHAINS } from '@fractional-company/common';
import { isValidChain } from '../utilities';
import { ERC721Config } from '../types/types';
import abi from '../abis/erc721.json';

export class ERC721 {
  public address: string;
  public isReadOnly: boolean;
  private erc721: Contract;

  constructor({ address, signerOrProvider, chainId = CHAINS.MAINNET }: ERC721Config) {
    if (!isAddress(address)) throw new Error('ERC721 contract address is not valid');
    if (!isValidChain(chainId)) throw new Error('Chain ID is not valid');

    this.address = address;
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.erc721 = new Contract(address, abi, signerOrProvider);
  }

  public async safeTransferFrom(
    from: string,
    to: string,
    tokenId: number,
    data?: BytesLike
  ): Promise<TransactionResponse> {
    this.verifyIsNotReadOnly();

    if (!isAddress(from)) throw new Error('From address is not valid');
    if (!isAddress(to)) throw new Error('To address is not valid');
    if (typeof tokenId !== 'number') throw new Error('Token ID must be a number');

    let safeTransferFrom;
    let params = [];
    if (data) {
      safeTransferFrom = 'safeTransferFrom(address,address,uint256,bytes)';
      params = [from, to, tokenId, data];
    } else {
      safeTransferFrom = 'safeTransferFrom(address,address,uint256)';
      params = [from, to, tokenId];
    }

    const tx: TransactionResponse = await this.erc721[safeTransferFrom](...params);
    return tx;
  }

  public async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<TransactionResponse> {
    this.verifyIsNotReadOnly();

    if (!isAddress(operator)) throw new Error('Operator address is not valid');
    if (typeof approved !== 'boolean') throw new Error('Approved must be a boolean');

    const tx: TransactionResponse = await this.erc721.setApprovalForAll(operator, approved);
    return tx;
  }

  // Private methods
  private verifyIsNotReadOnly() {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
