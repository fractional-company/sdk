/* eslint-disable */
import { Signer, Contract, BigNumberish } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { isAddress } from '@ethersproject/address';
import { isValidChain } from '../utilities';
import { VaultConfig, FactoryItem } from '../types/types';
import {
  getFactoryContractsMappedForChain,
  TYPE_VAULT_FACTORY,
  SCHEMA_ERC1155,
  SCHEMA_ERC20
} from '@fractional-company/common';

export class Vault {
  public isReadOnly: boolean;
  public address: string;
  public fractionSchema: string;
  private vault: Contract;

  constructor({ address, factoryAddress, chainId, signerOrProvider }: VaultConfig) {
    if (!isAddress(address)) throw new Error('Vault address is not valid');
    if (!isAddress(factoryAddress)) throw new Error('Factory address is not valid');
    if (!isValidChain(chainId)) throw new Error('Chain ID is not valid');

    const factories: FactoryItem[] = getFactoryContractsMappedForChain(chainId)[TYPE_VAULT_FACTORY];
    const factory = factories.find((factory) => factory.contractAddress === factoryAddress);
    if (!factory) throw new Error(`Vault factory contract ${factoryAddress} does not exist`);

    const { abi, fractionSchema } = factory.vault;
    this.address = address;
    this.fractionSchema = fractionSchema;
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.vault = new Contract(address, abi, signerOrProvider);
  }

  public async allowance(owner: string, spender: string): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.allowance(owner, spender);
  }

  public async approve(spender: string, amount: BigNumberish): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    return await this.vault.approve(spender, amount);
  }

  public async auctionEnd(): Promise<BigNumberish> {
    return await this.vault.auctionEnd();
  }

  public async auctionLength(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.auctionLength();
  }

  public async auctionState(): Promise<BigNumberish> {
    return this.vault.auctionState();
  }

  public async balanceOf(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.balanceOf();
  }

  public async bid(amount: number | string): Promise<void> {
    this.verifyIsNotReadOnly();
    if (typeof amount !== 'string' && typeof amount !== 'number') {
      throw new Error('Amount must be a string or number');
    }

    return await this.vault.bid({
      value: parseEther(String(amount))
    });
  }

  public async cash(): Promise<void> {
    this.verifyIsNotReadOnly();
    return await this.vault.cash();
  }

  public async claimFees(): Promise<void> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    return await this.vault.claimFees();
  }

  public async curator(): Promise<BigNumberish> {
    return await this.vault.curator();
  }

  public async decimals(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.decimals();
  }

  public async decreaseAllowance(): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    return await this.vault.decreaseAllowance();
  }

  public async end(): Promise<void> {
    this.verifyIsNotReadOnly();
    return await this.vault.end();
  }

  public async fee(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.fee();
  }

  public async fractions(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC1155);
    return await this.vault.fractions();
  }

  public async fractionsID(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC1155);
    return await this.vault.fractionsID();
  }

  public async id(): Promise<BigNumberish> {
    return await this.vault.id();
  }

  public async increaseAllowance(): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    return await this.vault.increaseAllowance();
  }

  public async initialize(): Promise<void> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    return await this.vault.initialize();
  }

  public async updateFee(fee: number): Promise<void> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    return await this.vault.updateFee(fee);
  }

  private verifyIsNotReadOnly() {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }

  private verifyMethod(requiredFractionSchema: string) {
    if (requiredFractionSchema.toLowerCase() !== this.fractionSchema.toLowerCase())
      throw new Error(`Method only available in ${requiredFractionSchema} vaults`);
  }
}
