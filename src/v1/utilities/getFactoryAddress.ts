import { Contract, Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { isAddress } from '@ethersproject/address';
import { isValidChain } from './isValidChain';
import { FactoryItem } from '../types/types';
import {
  getFactoryContractsMappedForChain,
  TYPE_VAULT_FACTORY,
  CHAINS
} from '@fractional-company/common';

export async function getFactoryAddress(
  vaultAddress: string,
  signerOrProvider: Signer | Provider,
  chainId: number | string = CHAINS.MAINNET
): Promise<string> {
  if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');
  if (!isValidChain(chainId)) throw new Error('Chain ID is not valid');
  if (!Provider.isProvider(signerOrProvider) && !Signer.isSigner(signerOrProvider))
    throw new Error('Provider/Signer is not valid');

  const factories: FactoryItem[] = getFactoryContractsMappedForChain(chainId)[TYPE_VAULT_FACTORY];

  for (const factory of factories) {
    const factoryContract = new Contract(factory.contractAddress, factory.abi, signerOrProvider);
    const events = await factoryContract.queryFilter(factoryContract.filters.Mint(), factory.block);
    for (const event of events) {
      if (event?.args?.vault === vaultAddress) {
        return factory.contractAddress;
      }
    }
  }

  throw new Error(`Vault factory contract for vault ${vaultAddress} does not exist`);
}
