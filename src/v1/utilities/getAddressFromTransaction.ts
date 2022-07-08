import { TransactionReceipt } from '@ethersproject/providers';

export function getAddressFromTransaction(txReceipt: TransactionReceipt): string {
  return txReceipt.logs[0].address;
}
