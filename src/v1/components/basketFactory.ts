import { Contract, Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { isAddress } from '@ethersproject/address';
import { isValidChain } from '../utilities';
import { executeTransaction } from '../helpers';
import { Basket, BasketFactoryConfig, BasketFactoryItem } from '../types/types';
import {
  CHAINS,
  CHAIN_NAMES,
  getBasketItem,
  getLatestBasketItem
} from '@fractional-company/common';

export class BasketFactory {
  public address: string;
  public isReadOnly: boolean;
  private basketFactory: Contract;
  private signerOrProvider: Signer | Provider;

  constructor({ signerOrProvider, chainId = CHAINS.MAINNET, address }: BasketFactoryConfig) {
    if (!isValidChain(chainId)) throw new Error('Chain ID is not valid');
    if (address && !isAddress(address)) throw new Error('Factory address is not valid');

    let factoryItem: BasketFactoryItem;
    if (!address) {
      factoryItem = getLatestBasketItem(chainId);
    } else {
      factoryItem = getBasketItem(chainId, address);
      if (!factoryItem) {
        throw new Error(
          `Basket factory contract ${address} does not exist on ${CHAIN_NAMES[chainId]} chain`
        );
      }
    }

    const { abi, contractAddress } = factoryItem;
    this.address = contractAddress;
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.basketFactory = new Contract(contractAddress, abi, signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public async createBasket(): Promise<Basket> {
    if (this.isReadOnly) throw new Error('Signer is required to create a basket');

    const txReceipt = await executeTransaction({
      contract: this.basketFactory,
      method: 'createBasket',
      signerOrProvider: this.signerOrProvider
    });

    if (!txReceipt || !txReceipt.status) throw new Error(`Transaction failed`);

    const basket = {
      address: txReceipt.logs[0].address,
      tokenId: 0
    };

    return basket;
  }
}
