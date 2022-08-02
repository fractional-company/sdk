import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from 'ethers';
import { Connection } from '../types/types';

export function isValidConnection(connection: Connection): boolean {
  return Signer.isSigner(connection) || Provider.isProvider(connection);
}
