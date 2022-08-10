import { Contract } from 'ethers';
import { isAddress } from '@ethersproject/address';
import { isValidChain, getChainId } from './index';
import { Proof, Connection } from '../types/types';
import { ModulesContracts, Contracts, Proofs, Variants } from '../constants';

export async function getProofsByAddress(
  vaultAddress: string,
  variant: Variants,
  connection: Connection
): Promise<Proof> {
  const chainId = await getChainId(connection);
  if (!isValidChain(chainId)) throw new Error(`Chain ${chainId} is not supported`);
  if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);

  const { ABI, address } = Contracts.BaseVault[variant];
  const baseVault = new Contract(address[chainId], ABI, connection);

  const events = await baseVault.queryFilter(baseVault.filters.ActiveModules(vaultAddress));
  if (events.length === 0) throw new Error(`Vault ${vaultAddress} does not exist`);

  const modules = events[0]?.args?.[1];
  if (!modules) throw new Error(`Vault ${vaultAddress} does not have any modules`);

  const proofKeys = [];
  for (const moduleAddress of modules) {
    for (const contractKey in ModulesContracts) {
      const contract = ModulesContracts[contractKey][variant];
      const contractAddress = contract.address[chainId];
      if (contractAddress === moduleAddress) {
        proofKeys.push(contractKey);
      }
    }
  }

  const proofsKey = proofKeys.sort().join('_');
  const proofs = Proofs[proofsKey]?.[variant]?.[chainId];
  if (!proofs) throw new Error(`Can't find proofs for vault ${vaultAddress}`);

  return proofs;
}

export function getProofsByModules(modules: string[], variant: string, chainId: number): Proof {
  if (!Array.isArray(modules)) throw new Error('Modules must be an array');

  const names: {
    [key: string]: string;
  } = {};

  for (const moduleName of modules) {
    if (typeof moduleName !== 'string') throw new Error('Module name must be a string');
    const upperCaseName = moduleName.toUpperCase();
    if (!names[upperCaseName]) {
      names[upperCaseName] = upperCaseName;
    }
  }

  const key = Object.values(names).sort().join('_');
  const proofs = Proofs[key]?.[variant]?.[chainId];
  if (!proofs) throw new Error(`Combination of modules is not supported`);

  return proofs;
}
