import { Chain } from './chains';
import { ArtEnjoyerProtoform } from '@fractional-company/common';

type Proofs = {
  mintProof: string[];
  redeemProof: string[];
  burnProof: string[];
  withdrawERC20Proof: string[];
  withdrawERC721Proof: string[];
  withdrawERC1155proof: string[];
  batchWithdrawERC1155Proof: string[];
};

export const getProofs = (chain: Chain, modules?: string[]): Proofs => {
  const protoform = ArtEnjoyerProtoform.getProtoform(chain, modules);
  return protoform?.proofs as Proofs;
};
