import { Provider } from '@ethersproject/abstract-provider';
import { Contract, Signer } from 'ethers';
import { isAddress } from '@ethersproject/address';
import { isValidChain, getChainId } from './index';
import { Proof } from '../types/types';
import { Contracts, Proofs } from '../common';

export async function getProofsByAddress(
  vaultAddress: string,
  signerOrProvider: Signer | Provider
): Promise<Proof> {
  const chainId = await getChainId(signerOrProvider);
  if (!isValidChain(chainId)) throw new Error(`Chain ${chainId} is not supported`);
  if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);

  const { ABI, address } = Contracts.BaseVault;
  const baseVault = new Contract(address[chainId], ABI, signerOrProvider);

  const events = await baseVault.queryFilter(baseVault.filters.ActiveModules(vaultAddress));
  if (events.length === 0) throw new Error(`Vault ${vaultAddress} does not exist`);

  const modules = events[0]?.args?.[1];
  if (!modules) throw new Error(`Vault ${vaultAddress} does not have any modules`);

  const proofKeys = [];
  for (const moduleAddress of modules) {
    for (const contractKey in Contracts) {
      const contract = Contracts[contractKey];
      if (contract.address[chainId] === moduleAddress) {
        proofKeys.push(contractKey);
      }
    }
  }

  const proofsKey = proofKeys.join('_');
  const proofs = Proofs[proofsKey]?.[chainId];
  if (!proofs) throw new Error(`Vault ${vaultAddress} does not have any proofs`);

  return proofs;
}

export function getProofsByModules(modules: string[], chainId: number): Proof {
  if (!Array.isArray(modules)) throw new Error('Modules must be an array');

  const key = modules.join('_');
  const proofs = Proofs[key]?.[chainId];
  if (!proofs) throw new Error(`Can't find proofs for specified modules`);

  return proofs;
}
