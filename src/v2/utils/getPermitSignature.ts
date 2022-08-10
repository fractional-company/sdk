import { Contract, Signer, utils } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';

export async function getPermitSignature(
  operator: string,
  contract: Contract,
  signer: Signer | Provider
): Promise<{
  r: string;
  s: string;
  v: number;
  deadline: number;
  approved: boolean;
}> {
  if (!Signer.isSigner(signer)) throw new Error('Signer is required');
  const deadline = Date.now() + 20 * 6000;
  const owner = await signer.getAddress();

  const [nonce] = await contract.functions.nonces(owner);
  const [contractName] = await contract.functions.NAME();
  const [version] = await contract.functions.VERSION();
  const chainId = await signer.getChainId();
  const approved = true;

  const message = {
    owner,
    operator,
    approved,
    nonce: parseInt(nonce),
    deadline
  };

  const domain = {
    name: contractName,
    version,
    chainId,
    verifyingContract: contract.address
  };

  const types = {
    PermitAll: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  // todo: function "_signTypedData" is experimental. Eventually it should change to "signTypedData"
  // @ts-ignore: Property '_signTypedData' does not exist on type 'Signer'.
  // eslint-disable-next-line
  const signature = await signer._signTypedData(domain, types, message);
  const { r, s, v } = utils.splitSignature(signature);
  return {
    r,
    s,
    v,
    deadline,
    approved
  };
}
