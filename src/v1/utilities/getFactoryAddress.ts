/* eslint-disable */
import { Contract } from 'ethers';
import { isAddress } from '@ethersproject/address';
import { Provider } from '@ethersproject/abstract-provider';
import { getFactoryContractsMappedForChain, TYPE_VAULT_FACTORY } from '@fractional-company/common';

interface VaultFactory {
  abi: any;
  contractAddress: string;
  block: number;
  vault: {
    fractionSchema: string;
    abi: any;
  };
}

function getVaultFactories(chainId: number): VaultFactory[] {
  const vaultFactories: VaultFactory[] | undefined =
    getFactoryContractsMappedForChain(chainId)[TYPE_VAULT_FACTORY];

  if (!vaultFactories) throw new Error(`Chain is not supported`);
  return vaultFactories;
}

export async function getFactoryAddress(
  vaultAddress: string,
  chainId: number,
  provider: Provider
): Promise<string> {
  if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');
  if (typeof chainId !== 'number') throw new Error('Chain ID is not valid');
  if (!Provider.isProvider(provider)) throw new Error('Provider is not valid');

  const vaultFactories: VaultFactory[] = getVaultFactories(chainId);
  for (const factory of vaultFactories) {
    const factoryContract = new Contract(factory.contractAddress, factory.abi, provider);
    const events = await factoryContract.queryFilter(factoryContract.filters.Mint(), factory.block);
    for (const event of events) {
      if (event?.args?.vault === vaultAddress) {
        return factory.contractAddress;
      }
    }
  }

  throw new Error(`Vault factory contract for vault ${vaultAddress} does not exist`);
}
