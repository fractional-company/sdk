/* eslint-disable */
import { Signer, Contract, Transaction } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { isAddress } from '@ethersproject/address';
import { isValidFractionSchema, isValidChain } from '../utilities';
import { FactoryItem, FactoryConfig, VaultData } from '../types/types';
import erc721Abi from '../abis/erc721.json';
import {
  getVaultItem,
  getLatestVaultItem,
  SCHEMA_ERC20,
  SCHEMA_ERC1155,
  CHAINS
} from '@fractional-company/common';

export class VaultFactory {
  public fractionSchema: string;
  public address: string;
  public isReadOnly: boolean;
  private abi: any;
  private signerOrProvider: Signer | Provider;
  private vaultFactory: Contract;

  constructor({
    fractionSchema,
    address,
    signerOrProvider,
    chainId = CHAINS.MAINNET
  }: FactoryConfig) {
    if (!isValidChain(chainId)) throw new Error('Chain ID is not valid');
    if (!address && !fractionSchema)
      throw new Error('Factory address or fraction schema is required');
    if (fractionSchema && !isValidFractionSchema(fractionSchema))
      throw new Error('Fraction schema is not valid');
    if (address && !isAddress(address)) throw new Error('Factory address is not valid');

    let factory: FactoryItem;
    if (address) {
      factory = getVaultItem(chainId, address);
      if (!factory) throw new Error(`Vault factory contract ${address} does not exist`);
    } else {
      factory = getLatestVaultItem(chainId, fractionSchema?.toUpperCase());
    }

    this.abi = factory.abi;
    this.address = factory.contractAddress;
    this.fractionSchema = factory.vault.fractionSchema;

    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.signerOrProvider = signerOrProvider;
    this.vaultFactory = new Contract(this.address, this.abi, this.signerOrProvider);
  }

  public async setApproval(nftContractAddress: string): Promise<Transaction> {
    if (this.isReadOnly) throw new Error('Signer is required to set approval');
    if (!isAddress(nftContractAddress)) throw new Error('NFT contract address is not valid');

    const nftContract = new Contract(nftContractAddress, erc721Abi, this.signerOrProvider);
    const tx: Transaction = await nftContract.setApprovalForAll(this.address, true);
    return tx;
  }

  public async mint({
    name,
    symbol,
    token,
    id,
    amount,
    listPrice,
    fee
  }: VaultData): Promise<Transaction> {
    if (this.isReadOnly) throw new Error('Signer is required to mint a vault');

    if (!amount) throw new Error('Supply is required');
    if (!token) throw new Error('Token is required');
    if (!id) throw new Error('Id is required');

    if (this.fractionSchema === SCHEMA_ERC20 && !symbol) throw new Error('Symbol is required');
    if (this.fractionSchema === SCHEMA_ERC20 && !name) throw new Error('Name is required');
    if (this.fractionSchema === SCHEMA_ERC20 && !fee) throw new Error('Fee is required');
    if (this.fractionSchema === SCHEMA_ERC20 && !listPrice)
      throw new Error('List price is required');

    let args: Array<any> = [];
    if (this.fractionSchema === SCHEMA_ERC20) {
      args = [name, symbol, token, id, amount, listPrice, fee];
    } else if (this.fractionSchema === SCHEMA_ERC1155) {
      args = [token, id, amount];
    }

    const gasEstimate = await this.vaultFactory.estimateGas.mint(...args);
    const gasLimit = gasEstimate.mul(110).div(100);

    const tx: Transaction = await this.vaultFactory.mint(...args, {
      gasLimit
    });
    return tx;
  }
}
