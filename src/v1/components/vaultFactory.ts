/* eslint-disable */
import { Signer, Contract } from 'ethers';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/providers';
import { isAddress } from '@ethersproject/address';
import { isValidFractionSchema, isValidChain } from '../utilities';
import { FactoryItem, FactoryConfig, VaultData, VaultMintResponse } from '../types/types';
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

    this.vaultFactory = new Contract(factory.contractAddress, factory.abi, signerOrProvider);
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.fractionSchema = factory.vault.fractionSchema;
    this.address = factory.contractAddress;
  }

  public async mint({
    name,
    symbol,
    token,
    id,
    amount,
    listPrice,
    fee = 0
  }: VaultData): Promise<VaultMintResponse> {
    if (this.isReadOnly) throw new Error('Signer is required to mint a vault');

    if (!amount) throw new Error('Supply is required');
    if (!token) throw new Error('Token is required');
    if (id === undefined || id === null) throw new Error('Id is required');

    if (this.fractionSchema === SCHEMA_ERC20 && !symbol) throw new Error('Symbol is required');
    if (this.fractionSchema === SCHEMA_ERC20 && !name) throw new Error('Name is required');
    if (this.fractionSchema === SCHEMA_ERC20 && !listPrice)
      throw new Error('List price is required');
    if (this.fractionSchema === SCHEMA_ERC20 && (!Number.isInteger(fee) || fee < 0 || fee > 100))
      throw new Error('Curator fee must be an integer between 0 and 100');

    let args: Array<any> = [];
    if (this.fractionSchema === SCHEMA_ERC20) {
      args = [name, symbol, token, id, amount, listPrice, fee];
    } else if (this.fractionSchema === SCHEMA_ERC1155) {
      args = [token, id, amount];
    }

    const gasEstimate = await this.vaultFactory.estimateGas.mint(...args);
    const gasLimit = gasEstimate.mul(110).div(100);

    const tx: TransactionResponse = await this.vaultFactory.mint(...args, {
      gasLimit
    });

    const txReceipt: TransactionReceipt = await tx.wait();
    if (!txReceipt || !txReceipt.status) throw new Error(`Transaction ${tx.hash} failed`);

    const vaultAddress = txReceipt.logs[0].address;
    return {
      vaultAddress
    };
  }
}
