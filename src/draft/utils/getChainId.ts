import { Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { Connection } from '../types/types';

export async function getChainId(connection: Connection): Promise<number> {
  const isSigner = Signer.isSigner(connection);
  const isProvider = Provider.isProvider(connection);
  if (!isSigner && !isProvider) throw new Error('Signer/Provider is not valid');

  if (isSigner) {
    return await connection.getChainId();
  } else if (isProvider) {
    const network = await connection.getNetwork();
    return network.chainId;
  } else {
    throw new Error('Signer/Provider is not valid');
  }
}
