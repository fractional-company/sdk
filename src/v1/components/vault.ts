/* eslint-disable */
import { Signer, Contract, BigNumberish, Transaction } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { isAddress } from '@ethersproject/address';
import { daysToSeconds } from '../helpers/dates';
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

  public async allowance(owner: string, spender: string): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.allowance(owner, spender);
  }

  public async approve(spender: string, amount: BigNumberish): Promise<Transaction> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    const gasEstimate = await this.vault.estimateGas.approve(spender, amount);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.approve(spender, amount, {
      gasLimit
    });
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

  public async balanceOf(account: string): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.balanceOf(account);
  }

  public async bid(): Promise<Transaction> {
    this.verifyIsNotReadOnly();

    const gasEstimate = await this.vault.estimateGas.bid();
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.bid({
      gasLimit
    });
  }

  public async cash(): Promise<Transaction> {
    this.verifyIsNotReadOnly();
    return await this.vault.cash();
  }

  public async claimFees(): Promise<Transaction> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    return await this.vault.claimFees();
  }

  public async curator(): Promise<string> {
    return await this.vault.curator();
  }

  public async decimals(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.decimals();
  }

  public async decreaseAllowance(
    spender: string,
    subtractedValue: BigNumberish
  ): Promise<Transaction> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    return await this.vault.decreaseAllowance(spender, subtractedValue);
  }

  public async end(): Promise<Transaction> {
    this.verifyIsNotReadOnly();
    return await this.vault.end();
  }

  public async fee(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.fee();
  }

  public async fractions(): Promise<string> {
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

  public async increaseAllowance(spender: string, addedValue: BigNumberish): Promise<Transaction> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    return await this.vault.increaseAllowance(spender, addedValue);
  }

  public async isLivePrice(price: BigNumberish): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC1155);
    return await this.vault.isLivePrice(price);
  }

  public async lastClaimed(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.lastClaimed();
  }

  public async livePrice(): Promise<BigNumberish> {
    return await this.vault.livePrice();
  }

  public async name(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.name();
  }

  public async priceToCount(value: BigNumberish): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC1155);
    return await this.vault.priceToCount(value);
  }

  public async reservePrice(): Promise<BigNumberish[] | BigNumberish> {
    return await this.vault.reservePrice();
  }

  public async reserveTotal(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.reserveTotal();
  }

  public async settings(): Promise<string> {
    return await this.vault.settings();
  }

  public async supportsInterface(interfaceId: string): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC1155);
    return await this.vault.supportsInterface(interfaceId);
  }

  public async symbol(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.symbol();
  }

  public async token(): Promise<string> {
    return await this.vault.token();
  }

  public async totalSupply(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.totalSupply();
  }

  public async underlying(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC1155);
    return await this.vault.underlying();
  }

  public async underlyingID(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC1155);
    return await this.vault.underlyingID();
  }

  public async updateAuctionLength(days: number): Promise<Transaction> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (typeof days !== 'number') throw new Error('Days must be a number');
    if (days < 0) throw new Error('Days must be greater than 0');

    const seconds = daysToSeconds(days);
    const gasEstimate = await this.vault.estimateGas.updateAuctionLength(seconds);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.updateAuctionLength(seconds, {
      gasLimit
    });
  }

  public async updateCurator(curator: string): Promise<Transaction> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    if (!isAddress(curator)) throw new Error('Curator address is not valid');

    const gasEstimate = await this.vault.estimateGas.updateCurator(curator);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.updateCurator(curator, {
      gasLimit
    });
  }

  public async updateFee(fee: number): Promise<Transaction> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    const gasEstimate = await this.vault.estimateGas.updateFee(fee);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.updateFee(fee, {
      gasLimit
    });
  }

  public async updateUserPrice(newPrice: BigNumberish): Promise<Transaction> {
    this.verifyIsNotReadOnly();

    const gasEstimate = await this.vault.estimateGas.updateUserPrice(newPrice);
    const gasLimit = gasEstimate.mul(110).div(100);
    return await this.vault.updateUserPrice(newPrice, {
      gasLimit
    });
  }

  public async userPrices(address: string): Promise<BigNumberish | BigNumberish[]> {
    return await this.vault.userPrices(address);
  }

  public async vaultClosed(): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.vaultClosed();
  }

  public async version(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC1155);
    return await this.vault.version();
  }

  public async votingTokens(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return await this.vault.votingTokens();
  }

  public async weth(): Promise<string> {
    return await this.vault.weth();
  }

  public async winning(): Promise<string> {
    return await this.vault.winning();
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
