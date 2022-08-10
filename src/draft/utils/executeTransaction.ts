import { Contract } from 'ethers';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/providers';
import { Connection, ContractOverrides } from '../types/types';

interface Config {
  connection: Connection;
  contract: Contract;
  method: string;
  args?: any[];
  options?: ContractOverrides;
}

export async function executeTransaction({
  connection,
  contract,
  method,
  args = [],
  options = {}
}: Config): Promise<TransactionReceipt> {
  const nonce = await connection.getTransactionCount('latest');
  const { maxFeePerGas, maxPriorityFeePerGas } = await connection.getFeeData();
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
