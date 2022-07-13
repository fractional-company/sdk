import { BytesLike, Contract, Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { TransactionReceipt } from '@ethersproject/providers';
import { isAddress } from '@ethersproject/address';
import { Chains } from '../common';
import { isValidChain, executeTransaction } from '../utils';
import { ABI } from '../common';

interface ERC721Config {
  address: string;
  signerOrProvider: Signer | Provider;
  chainId: number;
}

export class ERC721 {
  public address: string;
  private isReadOnly: boolean;
  private erc721: Contract;
  private signerOrProvider: Signer | Provider;

  constructor({ address, signerOrProvider, chainId = Chains.Mainnet }: ERC721Config) {
    if (!isAddress(address)) throw new Error('ERC721 contract address is not valid');
    if (!isValidChain(chainId)) throw new Error('Chain ID is not valid');

    this.address = address;
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.erc721 = new Contract(address, ABI.erc721, signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public safeTransferFrom(
    from: string,
    to: string,
    tokenId: number,
    data?: BytesLike
  ): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();

    if (!isAddress(from)) throw new Error('From address is not valid');
    if (!isAddress(to)) throw new Error('To address is not valid');
    if (typeof tokenId !== 'number') throw new Error('Token ID must be a number');

    let method;
    let args = [];
    if (data) {
      method = 'safeTransferFrom(address,address,uint256,bytes)';
      args = [from, to, tokenId, data];
    } else {
      method = 'safeTransferFrom(address,address,uint256)';
      args = [from, to, tokenId];
    }

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.erc721,
      method,
      args
    });
  }

  public setApprovalForAll(operator: string, approved: boolean): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();

    if (!isAddress(operator)) throw new Error('Operator address is not valid');
    if (typeof approved !== 'boolean') throw new Error('Approved must be a boolean');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.erc721,
      method: 'setApprovalForAll',
      args: [operator, approved]
    });
  }

  // Private methods
  private verifyIsNotReadOnly() {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
