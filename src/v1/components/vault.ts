/* eslint-disable */
import { Signer, Contract, BigNumberish } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';
import { isAddress } from '@ethersproject/address';
import { isValidChain } from '../utilities';
import { VaultConfig, FactoryItem } from '../types/types';
import {
  getFactoryContractsMappedForChain,
  TYPE_VAULT_FACTORY,
  SCHEMA_ERC1155,
  SCHEMA_ERC20,
  CHAINS
} from '@fractional-company/common';

export class Vault {
  public isReadOnly: boolean;
  public address: string;
  public fractionSchema: string;
  private vault: Contract;

  constructor({
    address,
    factoryAddress,
    signerOrProvider,
    chainId = CHAINS.MAINNET
  }: VaultConfig) {
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

  public allowance(owner: string, spender: string): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.allowance(owner, spender);
  }

  public async approve(spender: string, amount: BigNumberish): Promise<TransactionResponse> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    const gasEstimate = await this.vault.estimateGas.approve(spender, amount);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.approve(spender, amount, {
      gasLimit
    });
  }

  public auctionEnd(): Promise<BigNumberish> {
    return this.vault.auctionEnd();
  }

  public auctionLength(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.auctionLength();
  }

  public auctionState(): Promise<BigNumberish> {
    return this.vault.auctionState();
  }

  public balanceOf(account: string): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.balanceOf(account);
  }

  public async bid(): Promise<TransactionResponse> {
    this.verifyIsNotReadOnly();

    const gasEstimate = await this.vault.estimateGas.bid();
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.bid({
      gasLimit
    });
  }

  public cash(): Promise<TransactionResponse> {
    this.verifyIsNotReadOnly();
    return this.vault.cash();
  }

  public claimFees(): Promise<TransactionResponse> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    return this.vault.claimFees();
  }

  public curator(): Promise<string> {
    return this.vault.curator();
  }

  public decimals(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.decimals();
  }

  public decreaseAllowance(
    spender: string,
    subtractedValue: BigNumberish
  ): Promise<TransactionResponse> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    return this.vault.decreaseAllowance(spender, subtractedValue);
  }

  public end(): Promise<TransactionResponse> {
    this.verifyIsNotReadOnly();
    return this.vault.end();
  }

  public fee(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.fee();
  }

  public fractions(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.fractions();
  }

  public fractionsID(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.fractionsID();
  }

  public id(): Promise<BigNumberish> {
    return this.vault.id();
  }

  public increaseAllowance(
    spender: string,
    addedValue: BigNumberish
  ): Promise<TransactionResponse> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    return this.vault.increaseAllowance(spender, addedValue);
  }

  public isLivePrice(price: BigNumberish): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.isLivePrice(price);
  }

  public lastClaimed(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.lastClaimed();
  }

  public livePrice(): Promise<BigNumberish> {
    return this.vault.livePrice();
  }

  public name(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.name();
  }

  public priceToCount(value: BigNumberish): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.priceToCount(value);
  }

  public reservePrice(): Promise<BigNumberish[] | BigNumberish> {
    return this.vault.reservePrice();
  }

  public reserveTotal(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.reserveTotal();
  }

  public settings(): Promise<string> {
    return this.vault.settings();
  }

  public supportsInterface(interfaceId: string): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.supportsInterface(interfaceId);
  }

  public symbol(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.symbol();
  }

  public token(): Promise<string> {
    return this.vault.token();
  }

  public totalSupply(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.totalSupply();
  }

  public underlying(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.underlying();
  }

  public underlyingID(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.underlyingID();
  }

  public async updateAuctionLength(seconds: number): Promise<TransactionResponse> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (typeof seconds !== 'number') throw new Error('Seconds must be a number');
    if (seconds < 0) throw new Error('Seconds must be greater than 0');

    const gasEstimate = await this.vault.estimateGas.updateAuctionLength(seconds);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.updateAuctionLength(seconds, {
      gasLimit
    });
  }

  public async updateCurator(curator: string): Promise<TransactionResponse> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    if (!isAddress(curator)) throw new Error('Curator address is not valid');

    const gasEstimate = await this.vault.estimateGas.updateCurator(curator);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.updateCurator(curator, {
      gasLimit
    });
  }

  public async updateFee(fee: number): Promise<TransactionResponse> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    const gasEstimate = await this.vault.estimateGas.updateFee(fee);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.updateFee(fee, {
      gasLimit
    });
  }

  public async updateUserPrice(newPrice: BigNumberish): Promise<TransactionResponse> {
    this.verifyIsNotReadOnly();

    const gasEstimate = await this.vault.estimateGas.updateUserPrice(newPrice);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.updateUserPrice(newPrice, {
      gasLimit
    });
  }

  public userPrices(address: string): Promise<BigNumberish | BigNumberish[]> {
    return this.vault.userPrices(address);
  }

  public vaultClosed(): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.vaultClosed();
  }

  public version(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.version();
  }

  public votingTokens(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.votingTokens();
  }

  public weth(): Promise<string> {
    return this.vault.weth();
  }

  public winning(): Promise<string> {
    return this.vault.winning();
  }

  // Private methods
  private verifyIsNotReadOnly() {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }

  private verifyMethod(requiredFractionSchema: string) {
    if (requiredFractionSchema.toLowerCase() !== this.fractionSchema.toLowerCase())
      throw new Error(`Method only available on ${requiredFractionSchema} vaults`);
  }
}
