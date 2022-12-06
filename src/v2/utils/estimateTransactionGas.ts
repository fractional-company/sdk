import { BigNumberish, Contract } from 'ethers';
import { Connection, GasData } from '../types/types';

interface ContractOverrides {
  value?: BigNumberish;
}

interface Config {
  connection: Connection;
  contract: Contract;
  method: string;
  args?: any[];
  options?: ContractOverrides;
}

export async function estimateTransactionGas({
  connection,
  contract,
  method,
  args = [],
  options = {}
}: Config): Promise<GasData> {
  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await connection.getFeeData();
  const gasLimit = await contract.estimateGas[method](...args, {
    ...options
  });

  const totalGasFee = maxFeePerGas ? gasLimit.mul(maxFeePerGas).toString() : null;

  return {
    gasLimit: gasLimit.toString(),
    gasPrice: gasPrice ? gasPrice.toString() : null,
    maxFeePerGas: maxFeePerGas ? maxFeePerGas.toString() : null,
    maxPriorityFeePerGas: maxPriorityFeePerGas ? maxPriorityFeePerGas.toString() : null,
    totalGasFee
  };
}
