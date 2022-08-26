import { isAddress } from '@ethersproject/address';
import { BigNumber, Contract } from 'ethers';
import { Contracts, Variants } from '../constants';
import { Connection } from '../types/types';
import { getChainId, isValidChain } from './index';

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
  const response: [string, BigNumber] = await vaultRegistry.functions.vaultToToken(vaultAddress);
  return response[1].toString();
}
