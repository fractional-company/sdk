/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Provider } from '@ethersproject/abstract-provider';
import { BigNumber, Signer } from 'ethers';
import { Connection } from '../types/types';

export type Wallet = {
  address: string;
  balance: BigNumber;
};

export async function getCurrentWallet(connection: Connection): Promise<{
  address: string;
  balance: BigNumber;
}> {
  if (Signer.isSigner(connection)) {
    const address = await connection.getAddress();
    const balance = await connection.getBalance();
    return {
      address,
      balance
    };
  } else if (Provider.isProvider(connection)) {
    // @ts-ignore: Property 'getSigner' does not exist on type 'Provider'.
    const address = await connection.getSigner().getAddress(); // todo: this only works with JSON RPC providers
    const balance = await connection.getBalance(address);
    return {
      address,
      balance
    };
  } else {
    throw new Error('Signer or Provider is required');
  }
}
