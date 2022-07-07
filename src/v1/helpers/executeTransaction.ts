import { Signer, Contract } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/providers';
import { ContractOverrides } from '../types/types';

interface Config {
  signerOrProvider: Signer | Provider;
  contract: Contract;
  method: string;
  args?: any[];
  options?: ContractOverrides;
}

export async function executeTransaction({
  signerOrProvider,
  contract,
  method,
  args = [],
  options = {}
}: Config): Promise<TransactionReceipt> {
  const nonce = await signerOrProvider.getTransactionCount('latest');
  const { maxFeePerGas, maxPriorityFeePerGas } = await signerOrProvider.getFeeData();
  const gasLimit = await contract.estimateGas[method](...args, {
    ...options
  });

  const tx: TransactionResponse = await contract.functions[method](...args, {
    nonce,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    ...options
  });

  if (!tx) throw new Error('Transaction failed');

  return tx.wait();
}
