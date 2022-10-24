import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { BigNumberish, Contract } from 'ethers';
import { Connection } from '../types/types';

interface ContractOverrides {
  nonce?: BigNumberish;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  value?: BigNumberish;
}

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
