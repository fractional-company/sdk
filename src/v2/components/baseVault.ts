/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Signer, Contract, BigNumberish } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { TransactionReceipt } from '@ethersproject/providers';
import { isAddress } from '@ethersproject/address';
import { isValidChain, executeTransaction, isValidTokenStandard } from '../utils';
import { Chains, Contracts, TokenStandards } from '../common';

interface Arguments {
  signerOrProvider: Signer | Provider;
  chainId?: number;
}

interface Token {
  standard: string;
  address: string;
  id?: BigNumberish;
  amount?: BigNumberish;
  data?: string[];
}

export class BaseVault {
  public address: string;
  private baseVault: Contract;
  private isReadOnly: boolean;
  private signerOrProvider: Signer | Provider;

  constructor({ signerOrProvider, chainId = Chains.Mainnet }: Arguments) {
    if (!isValidChain(chainId)) throw new Error('Invalid chain ID');
    const ABI = Contracts.BaseVault.ABI;
    const address = Contracts.BaseVault.address[chainId];

    this.address = address;
    this.baseVault = new Contract(address, ABI, signerOrProvider);
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public batchDepositERC20(
    from: string,
    to: string,
    tokens: string[],
    amounts: BigNumberish[]
  ): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    if (!isAddress(from)) throw new Error(`Invalid from address ${from}`);
    if (!isAddress(to)) throw new Error(`Invalid to address ${to}`);
    if (!Array.isArray(tokens)) throw new Error('Tokens must be an array');
    if (!Array.isArray(amounts)) throw new Error('Amounts must be an array');
    if (tokens.length === 0) throw new Error('Tokens array must not be empty');
    if (amounts.length === 0) throw new Error('Amounts array must not be empty');
    if (tokens.length !== amounts.length)
      throw new Error('Tokens and amounts arrays must have the same length');
    for (const token of tokens) {
      if (!isAddress(token)) throw new Error(`Invalid token address ${token}`);
    }

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.baseVault,
      method: 'batchDepositERC20',
      args: [from, to, tokens, amounts]
    });
  }

  public batchDepositERC721(
    from: string,
    to: string,
    tokens: string[],
    ids: BigNumberish[]
  ): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();

    if (!isAddress(from)) throw new Error(`Invalid from address ${from}`);
    if (!isAddress(to)) throw new Error(`Invalid to address ${to}`);
    if (!Array.isArray(tokens)) throw new Error('Tokens must be an array');
    if (!Array.isArray(ids)) throw new Error('IDs must be an array');
    if (tokens.length === 0) throw new Error('Tokens array must not be empty');
    if (ids.length === 0) throw new Error('IDs array must not be empty');
    if (tokens.length !== ids.length)
      throw new Error('Tokens and IDs arrays must have the same length');
    for (const token of tokens) {
      if (!isAddress(token)) throw new Error(`Invalid token address ${token}`);
    }

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.baseVault,
      method: 'batchDepositERC721',
      args: [from, to, tokens, ids]
    });
  }

  public batchDepositERC1155(
    from: string,
    to: string,
    tokens: string[],
    ids: BigNumberish[],
    amounts: BigNumberish[],
    datas: string[]
  ): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    if (!isAddress(from)) throw new Error(`Invalid from address ${from}`);
    if (!isAddress(to)) throw new Error(`Invalid to address ${to}`);
    if (!Array.isArray(tokens)) throw new Error('Tokens must be an array');
    if (!Array.isArray(ids)) throw new Error('IDs must be an array');
    if (!Array.isArray(amounts)) throw new Error('Amounts must be an array');
    if (datas && !Array.isArray(datas)) throw new Error('Datas must be an array');
    if (tokens.length === 0) throw new Error('Tokens array must not be empty');
    if (ids.length === 0) throw new Error('IDs array must not be empty');
    if (amounts.length === 0) throw new Error('Amounts array must not be empty');
    if (tokens.length !== ids.length)
      throw new Error('Tokens and IDs arrays must have the same length');
    if (tokens.length !== amounts.length)
      throw new Error('Tokens and amounts arrays must have the same length');
    for (const token of tokens) {
      if (!isAddress(token)) throw new Error(`Invalid token address ${token}`);
    }

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.baseVault,
      method: 'batchDepositERC1155',
      args: [from, to, tokens, ids, amounts, datas]
    });
  }

  public batchDeposit(from: string, to: string, tokens: Token[]): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    if (!isAddress(from)) throw new Error(`Invalid from address ${from}`);
    if (!isAddress(to)) throw new Error(`Invalid to address ${to}`);
    if (!Array.isArray(tokens)) throw new Error('Tokens must be an array');
    if (tokens.length === 0) throw new Error('Tokens array must not be empty');

    const erc20Data: {
      addresses: string[];
      amounts: BigNumberish[];
    } = {
      addresses: [],
      amounts: []
    };

    const erc721Data: {
      addresses: string[];
      ids: BigNumberish[];
    } = {
      addresses: [],
      ids: []
    };

    const erc1155Data: {
      addresses: string[];
      ids: BigNumberish[];
      amounts: BigNumberish[];
      datas: string[];
    } = {
      addresses: [],
      ids: [],
      amounts: [],
      datas: []
    };

    for (const token of tokens) {
      if (!isAddress(token.address)) throw new Error(`Invalid token address ${token.address}`);
      if (!isValidTokenStandard(token.standard))
        throw new Error(`Invalid token standard ${token.standard}`);

      const tokenStandard = token.standard.toUpperCase();
      switch (tokenStandard) {
        case TokenStandards.ERC20:
          if (!token.amount) throw new Error(`ERC20 token ${token.address} must have an amount`);
          erc20Data.addresses.push(token.address);
          erc20Data.amounts.push(token.amount);
          break;
        case TokenStandards.ERC721:
          if (!token.id) throw new Error(`ERC721 token ${token.address} must have a token id`);
          erc721Data.addresses.push(token.address);
          erc721Data.ids.push(token.id);
          break;
        case TokenStandards.ERC1155:
          if (!token.id) throw new Error(`ERC1155 token ${token.address} must have a token id`);
          if (!token.amount) throw new Error(`ERC1155 token ${token.address} must have an amount`);
          if (token.data && typeof token.data !== 'string')
            throw new Error(`ERC1155 token ${token.address} data must be a string`);

          erc1155Data.addresses.push(token.address);
          erc1155Data.ids.push(token.id);
          erc1155Data.amounts.push(token.amount);
          erc1155Data.datas.push(token.data || '0x');
          break;
        default:
          throw new Error(`Invalid token standard ${tokenStandard} for token ${token.address}`);
      }
    }

    const encodedData: string[] = [];
    if (erc20Data.addresses.length > 0) {
      encodedData.push(
        this.baseVault.interface.encodeFunctionData('batchDepositERC20', [
          from,
          to,
          erc20Data.addresses,
          erc20Data.amounts
        ])
      );
    }

    if (erc721Data.addresses.length > 0) {
      encodedData.push(
        this.baseVault.interface.encodeFunctionData('batchDepositERC721', [
          from,
          to,
          erc721Data.addresses,
          erc721Data.ids
        ])
      );
    }

    if (erc1155Data.addresses.length > 0) {
      encodedData.push(
        this.baseVault.interface.encodeFunctionData('batchDepositERC1155', [
          from,
          to,
          erc1155Data.addresses,
          erc1155Data.ids,
          erc1155Data.amounts,
          erc1155Data.datas
        ])
      );
    }

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.baseVault,
      method: 'multicall',
      args: [encodedData]
    });
  }

  public deployVault(
    fractionSupply: BigNumberish,
    modules: string[],
    plugins: string[],
    selectors: string[],
    mintProof: string[]
  ): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.baseVault,
      method: 'deployVault',
      args: [fractionSupply, modules, plugins, selectors, mintProof]
    });
  }

  public getLeafNodes(): Promise<string[]> {
    return this.baseVault.getLeafNodes();
  }

  public getProof(data: string[], node: number): Promise<string[]> {
    return this.baseVault.getProof(data, node);
  }

  // Private methods
  private verifyIsNotReadOnly() {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
