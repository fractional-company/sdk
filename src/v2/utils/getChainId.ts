import { Signer } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';

export async function getChainId(signerOrProvider: Signer | Provider): Promise<number> {
  const isSigner = Signer.isSigner(signerOrProvider);
  const isProvider = Provider.isProvider(signerOrProvider);
  if (!isSigner && !isProvider) throw new Error('Signer/Provider is not valid');

  if (isSigner) {
    return await signerOrProvider.getChainId();
  } else if (isProvider) {
    const network = await signerOrProvider.getNetwork();
    return network.chainId;
  } else {
    throw new Error('Signer/Provider is not valid');
  }
}
