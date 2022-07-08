/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Signer, Contract, BigNumberish } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { TransactionReceipt } from '@ethersproject/providers';
import { isAddress } from '@ethersproject/address';
import { isValidChain } from '../utilities';
import { executeTransaction } from '../helpers';
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
  private signerOrProvider: Signer | Provider;

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
    this.signerOrProvider = signerOrProvider;
  }

  public allowance(owner: string, spender: string): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC20);
    return this.vault.allowance(owner, spender);
  }

  public approve(spender: string, amount: BigNumberish): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (!isAddress(spender)) throw new Error('Spender address is not valid');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'approve',
      args: [spender, amount]
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

  public bid(amount: BigNumberish): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'bid',
      options: {
        value: amount
      }
    });
  }

  public cash(): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'cash'
    });
  }

  public claimFees(): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'claimFees'
    });
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
  ): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'decreaseAllowance',
      args: [spender, subtractedValue]
    });
  }

  public end(): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'end'
    });
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

  public increaseAllowance(spender: string, addedValue: BigNumberish): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'increaseAllowance',
      args: [spender, addedValue]
    });
  }

  public isLivePrice(price: BigNumberish): Promise<boolean> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.isLivePrice(price);
  }

  public kickCurator(curator: string): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (!isAddress(curator)) throw new Error('Curator address is not valid');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'kickCurator',
      args: [curator]
    });
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

  public redeem(): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'redeem'
    });
  }

  public removeReserve(address: string): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (!isAddress(address)) throw new Error('Address is not valid');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'removeReserve',
      args: [address]
    });
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

  public start(amount: BigNumberish): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'start',
      options: {
        value: amount
      }
    });
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

  public transfer(recipient: string, amount: BigNumberish): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();
    if (!isAddress(recipient)) throw new Error('Recipient address is not valid');
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'transfer',
      args: [recipient, amount]
    });
  }

  public transferFrom(
    sender: string,
    recipient: string,
    amount: BigNumberish
  ): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (!isAddress(sender)) throw new Error('Sender address is not valid');
    if (!isAddress(recipient)) throw new Error('recipient address is not valid');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'transferFrom',
      args: [sender, recipient, amount]
    });
  }

  public underlying(): Promise<string> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.underlying();
  }

  public underlyingID(): Promise<BigNumberish> {
    this.verifyMethod(SCHEMA_ERC1155);
    return this.vault.underlyingID();
  }

  public updateAuctionLength(seconds: number): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (typeof seconds !== 'number') throw new Error('Seconds must be a number');
    if (seconds < 0) throw new Error('Seconds must be greater than 0');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'updateAuctionLength',
      args: [seconds]
    });
  }

  public updateCurator(curator: string): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (!isAddress(curator)) throw new Error('Curator address is not valid');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'updateCurator',
      args: [curator]
    });
  }

  public updateFee(fee: number): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC20);
    this.verifyIsNotReadOnly();

    if (!Number.isInteger(fee)) throw new Error('Fee must be an integer');
    if (fee < 0) throw new Error('Fee must be greater than 0');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'updateFee',
      args: [fee]
    });
  }

  public updateUserPrice(newPrice: BigNumberish): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'updateUserPrice',
      args: [newPrice]
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

  public withdrawERC1155(
    token: string,
    tokenId: BigNumberish,
    amount: BigNumberish
  ): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC1155);
    this.verifyIsNotReadOnly();

    if (!isAddress(token)) throw new Error('Token address is not valid');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'withdrawERC1155',
      args: [token, tokenId, amount]
    });
  }

  public withdrawERC20(token: string): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC1155);
    this.verifyIsNotReadOnly();

    if (!isAddress(token)) throw new Error('Token address is not valid');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'withdrawERC20',
      args: [token]
    });
  }

  public withdrawERC721(token: string, tokenId: BigNumberish): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC1155);
    this.verifyIsNotReadOnly();

    if (!isAddress(token)) throw new Error('Token address is not valid');

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'withdrawERC721',
      args: [token, tokenId]
    });
  }

  public withdrawETH(): Promise<TransactionReceipt> {
    this.verifyMethod(SCHEMA_ERC1155);
    this.verifyIsNotReadOnly();
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vault,
      method: 'withdrawETH'
    });
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
