import { Contract, Signer, BigNumber } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { isAddress } from '@ethersproject/address';
import { isValidChain, getChainId } from './index';
import { Contracts } from '../common';

export async function getVaultId(
  vaultAddress: string,
  signerOrProvider: Signer | Provider
): Promise<string> {
  const chainId = await getChainId(signerOrProvider);
  if (!isValidChain(chainId)) throw new Error(`Chain ${chainId} is not supported`);
  if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);

  const { ABI, address } = Contracts.VaultRegistry;
  const vaultRegistry = new Contract(address[chainId], ABI, signerOrProvider);

  const events = await vaultRegistry.queryFilter(vaultRegistry.filters.VaultDeployed(vaultAddress));
  if (events.length === 0) throw new Error(`Vault ${vaultAddress} does not exist`);

  const id: BigNumber = events[0]?.args?._id;
  return id.toString();
}
