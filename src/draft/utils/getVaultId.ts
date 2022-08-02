import { Connection } from './../types/types';
import { Contract, BigNumber } from 'ethers';
import { isAddress } from '@ethersproject/address';
import { isValidChain, getChainId } from './index';
import { Contracts } from '../constants';
import { Variants } from '../constants';

export async function getVaultId(
  vaultAddress: string,
  variant: Variants,
  connection: Connection
): Promise<string> {
  const chainId = await getChainId(connection);
  if (!isValidChain(chainId)) throw new Error(`Chain ${chainId} is not supported`);
  if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);

  const { ABI, address } = Contracts.VaultRegistry[variant];
  const vaultRegistry = new Contract(address[chainId], ABI, connection);

  const events = await vaultRegistry.queryFilter(vaultRegistry.filters.VaultDeployed(vaultAddress));
  if (events.length === 0) throw new Error(`Vault ${vaultAddress} does not exist`);

  const id: BigNumber = events[0]?.args?._id;
  return id.toString();
}
