import { isAddress } from '@ethersproject/address';
import { BigNumber } from 'ethers';
import { Chain, Contract } from '../constants';
import { VaultRegistry__factory as VaultRegistryFactory } from '../contracts';
import { Connection } from '../types/types';
import { getChainId, getContractAddress, isValidChain } from './index';

export async function getVaultId(vaultAddress: string, connection: Connection): Promise<string> {
  const chainId: Chain = await getChainId(connection);
  if (!isValidChain(chainId)) throw new Error(`Chain ${chainId} is not supported`);
  if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);

  const vaultRegistry = VaultRegistryFactory.connect(
    getContractAddress(Contract.VaultRegistry, chainId),
    connection
  );

  const response: [string, BigNumber] = await vaultRegistry.vaultToToken(vaultAddress);
  return response[1].toString();
}
