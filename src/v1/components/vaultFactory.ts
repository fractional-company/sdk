import { Provider } from '@ethersproject/abstract-provider';
import { isAddress } from '@ethersproject/address';
import { TransactionReceipt } from '@ethersproject/providers';
import {
  CHAINS,
  getLatestVaultItem,
  getVaultItem,
  SCHEMA_ERC1155,
  SCHEMA_ERC20
} from '@fractional-company/common';
import { Contract, Signer } from 'ethers';
import { executeTransaction } from '../helpers';
import { FactoryConfig, FactoryItem, VaultData } from '../types/types';
import { isValidChain, isValidFractionSchema } from '../utilities';

export class VaultFactory {
  public fractionSchema: string;
  public address: string;
  public isReadOnly: boolean;
  private vaultFactory: Contract;
  private signerOrProvider: Signer | Provider;

  constructor({
    fractionSchema,
    address,
    signerOrProvider,
    chainId = CHAINS.MAINNET
  }: FactoryConfig) {
    if (typeof chainId === 'string') {
      chainId = parseInt(chainId);
    }
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
    this.signerOrProvider = signerOrProvider;
  }

  public mint({
    name,
    symbol,
    token,
    id,
    amount,
    listPrice,
    fee = 0
  }: VaultData): Promise<TransactionReceipt> {
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

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.vaultFactory,
      method: 'mint',
      args
    });
  }
}
